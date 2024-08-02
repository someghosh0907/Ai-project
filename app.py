#line 51
from flask import Flask,request
from langchain_community.llms import Ollama
from langchain_text_splitters import CharacterTextSplitter,RecursiveCharacterTextSplitter
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from flask_sqlalchemy import SQLAlchemy
import requests
import os
import ollama
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from langchain_community.document_loaders import TextLoader #DirectoryLoader
import os
from langchain.prompts import ChatPromptTemplate,PromptTemplate
from typing import Optional
import chromadb
from chromadb.config import Settings
from langchain.vectorstores import Chroma
from langchain.document_loaders import DirectoryLoader
#from langchain.embeddings import GPT4AllEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_core.runnables import RunnablePassthrough
import glob
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders.unstructured import UnstructuredFileLoader
from flask_cors import CORS, cross_origin


CHROMA_DB_DIRECTORY='db'
DOCUMENT_SOURCE_DIRECTORY='/path/to/source/documents'
CHROMA_SETTINGS = Settings(
    chroma_db_impl='duckdb+parquet',
    persist_directory=CHROMA_DB_DIRECTORY,
    anonymized_telemetry=False
)
TARGET_SOURCE_CHUNKS=4
CHUNK_SIZE=500
CHUNK_OVERLAP=10
HIDE_SOURCE_DOCUMENTS=False
UPLOAD_FOLDER = '/home/vyrazu-70/Desktop/Upload_Files/'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
#cors = CORS(app, resources={r"ask": {"origins": "http://localhost:3000"}})
#CORS(app)
cors = CORS(app,support_credentials=True)#, resources={r"/*": {"origins": "*"}})

app.config['CORS_HEADERS'] = 'application/json'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = "ENTER YOUR SECRET KEY"
db = SQLAlchemy()

#DB Model for saving prompt history
class PromptQuery(db.Model):
    #__tablename__ = 'promptquery'

    id = db.Column(db.Integer, primary_key=True ,autoincrement=True)
    query = db.Column(db.String)
    def __repr__(self):
        return '<PromptQuery %r>' % (self.query)

db.init_app(app)
 
 
with app.app_context():
    db.create_all()

window_memory = ConversationBufferWindowMemory(k=5)#Let us create a ConversationBufferWindowMemory with k=1, which remembers only the previous 1 message
cached_llm=Ollama(model="llama3")

#Custom class for multiple files uploading
'''class CustomDirectoryLoader:
    def __init__(self, directory_path: str, glob_pattern: str = "*.*", mode: str = "single"):
        """
        Initialize the loader with a directory path and a glob pattern.
        :param directory_path: Path to the directory containing files to load.
        :param glob_pattern: Glob pattern to match files within the directory.
        :param mode: Mode to use with UnstructuredFileLoader ('single', 'elements', or 'paged').
        """
        self.directory_path = directory_path
        self.glob_pattern = glob_pattern
        self.mode = mode

    def load(self) -> List[Document]:
        """
        Load all files matching the glob pattern in the directory using UnstructuredFileLoader.
        :return: List of Document objects loaded from the files.
        """
        documents = []
        # Construct the full glob pattern
        full_glob_pattern = f"{self.directory_path}/{self.glob_pattern}"
        # Iterate over all files matched by the glob pattern
        for file_path in glob.glob(full_glob_pattern):
            # Use UnstructuredFileLoader to load each file
            loader = UnstructuredFileLoader(file_path=file_path, mode=self.mode)
            docs = loader.load()
            documents.extend(docs)
        return documents'''

#Processing the document data and accessing it through query
@app.route("/doc",methods=["POST"])
#@cross_origin
def docPost():
    embedder = OllamaEmbeddings(
    model='nomic-embed-text',
    show_progress=True,
    )
    if request.method == "POST":
        json_content=request.json
        query=json_content.get("query")
        userPrompt = PromptQuery(query=query)#input parameter
        #db.session.add(userPrompt)
        #db.session.execute('INSERT INTO promptquery (query) VALUES (?)',[userPrompt])
        #db.session.commit()
        # #Loading text
        loader = DirectoryLoader(r'/home/vyrazu-70/Desktop/flask_langchain/Upload_Files/', glob="**/*.txt", show_progress=True,use_multithreading=True)#Accessing the folder that is having the all the documents
        #loader = CustomDirectoryLoader(directory_path='/home/vyrazu-70/Desktop/flask_langchain/Upload_Files/', glob_pattern="**/*.@(pdf|txt|csv)", mode="elements")
        #loader = TextLoader("./dummy.txt") #loading single text file. #We can dynamically upload the text file.
        loaded_docs=loader.load() 
        #Splitgu 
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP
        )
        #Chunk
        chunked_docs = splitter.split_documents(loaded_docs)
        #Add to vector-DB
        vector_db = Chroma.from_documents(
            documents=chunked_docs,
            embedding=embedder,
            #client_settings=CHROMA_SETTINGS,
            collection_name='llm_vectorstore'
        )
    #Retrieval
        Query_Prompt=PromptTemplate(input_variables=["question"],template=""" You are an AI language model.Your task is to generate five different versions of 
                                the given user question to retrieve relevant document from the vector database.By generating multple perspectives on the user 
                                question, youe goal is to help the user overcome some of the limitations of distance based similarity search. Provide these 
                                alternatives questions separated by newlines. Original questions:{question}""")
        retriever_from_llm = MultiQueryRetriever.from_llm(
        vector_db.as_retriever(), llm=cached_llm,prompt=Query_Prompt
        )
        template="Answer the questions based on the following context:{context} Question:{question}"
        prompt=ChatPromptTemplate.from_template(template)
        chain=({"context":retriever_from_llm,"question":RunnablePassthrough()})| prompt |cached_llm | StrOutputParser()
        res=chain.invoke(query)
        result_doc={"res":res}
        print(result_doc)
        return result_doc

#def fileProcessing():

#Conventional method
@app.route("/ai",methods=["POST"])
#@cross_origin
def aiPost():
    if request.method == "POST":
        json_content=request.json
        query=json_content.get("query")
        userPrompt = PromptQuery(query=query)#input parameter
        #db.session.add(userPrompt)
        #db.session.execute('INSERT INTO promptquery (query) VALUES (?)',[userPrompt])
        #db.session.commit()
        print(f"query: {query}")
        #access(query)
        window_memory_chain = ConversationChain(llm = cached_llm,memory=window_memory)
        response=window_memory_chain.invoke(query)
            #print(response)
        response_answer={"answer":response}
        return response_answer
        
@app.route("/getquery",methods=['GET'])#Get all the Previous Prompts
def getPrompts():
    #queries = db.session.execute(db.select(PromptQuery))
    ans=PromptQuery.query.all()
    queries={"data":ans}
    return queries
    
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=["POST"])
def upload_file():                    #Upload Files
    upload_file=request.files['file']
    folder=os.path.join('Upload_Files/',upload_file.filename)
    upload_file.save(folder)
    return {"message":"File uploaded to successfully"}

def start_app():
    app.run(host="0.0.0.0",port=8080,debug=True)

if __name__=="__main__":
    start_app()

