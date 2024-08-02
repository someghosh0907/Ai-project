import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [buttonColourSearch, setButtonColourSearch] = useState("whitesmoke");
  const [buttonColourLLM, setButtonColourLLM] = useState("whitesmoke");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [promptList, setPromptList] = useState([]);
  const [promptOutput, setPromptOutput] = useState("");
  const displayData = [{ type: "", dataStream: "" }];

  const queryDocAndLLM = async (e) => {
    e.preventDefault();
    console.log("Submitted");
    console.log({ "query": query });
    const data = { "query": query };
    displayData.push({
      type: "input",
      dataStream: data,
    });
    const compare = localStorage.getItem("selectedButton");
    if (compare === "Doc") {
      console.log("doc");
      await axios
        .post("http://localhost:8080/doc", {
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          const result = res.data;
          //setPromptOutput(result)
          displayData.push({
            type: "output",
            dataStream: result,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (compare === "LLM") {
      console.log("llm");
      await axios
        .post("http://localhost:8080/ai", {
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          const result = res.data;
          //setPromptOutput(result)
          displayData.push({
            type: "output",
            dataStream: result,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  function getQuery() {
    axios({
      method: "GET",
      url: "/getquery",
    })
      .then((response) => {
        const res = response.data;
        setPromptList([res]);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  function handleSearchButtonChange() {
    if (buttonColourSearch === "whitesmoke") {
      setButtonColourSearch("green"); //This means we selected Doc Search button
      setButtonColourLLM("whitesmoke");
      setSelected("Doc");
      localStorage.setItem("selectedButton", "Doc");
    }
    if (buttonColourSearch === "green") {
      setButtonColourSearch("whitesmoke");
      setButtonColourLLM("green");
      setSelected("LLM"); //This means we selected LLM button
    }
  }
  function handleLLMButtonChange() {
    if (buttonColourLLM === "whitesmoke") {
      setButtonColourLLM("green"); //This means we selected LLM button
      setButtonColourSearch("whitesmoke");
      setSelected("LLM");
      localStorage.setItem("selectedButton", "LLM");
    }
    if (buttonColourLLM === "green") {
      setButtonColourLLM("whitesmoke");
      setButtonColourSearch("green");
      setSelected("Doc"); //This means we selected Doc Search button
    }
  }

  const handleQuery = (e) => {
    //Handle Query Change
    setQuery(e.target.value);
    console.log(e.target.value);
  };

  useEffect =
    (() => {
      getQuery();
    },
    []);
  return (
    <div>
      <header
        style={{
          marginTop: "40px",
          alignItems: "center",
          backgroundColor: `rgba(244,194,194,5)`,
          height: "90px",
          width: "100%",
        }}
      >
        <h2 style={{ padding: "27px", marginLeft: "800px" }}>Docufy-GPT</h2>
      </header>
      <div className="content" style={{ display: "flex" }}>
        <div className="ModeAndFile">
          <div
            style={{
              width: "550px",
              backgroundColor: "whitesmoke",
              borderRadius: "9px",
              padding: "10px",
              marginTop: "20px",
              paddingBottom: "40px",
            }}
          >
            <div style={{ color: "grey", marginLeft: "15px" }}>
              <h2>Mode</h2>
            </div>
            <div className="LLMoptions">
              <button
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  marginRight: "30px",
                  marginLeft: "15px",
                  backgroundColor: buttonColourSearch,
                }}
                onClick={handleSearchButtonChange}
              >
                Search in Docs
              </button>
              <button
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: buttonColourLLM,
                }}
                onClick={handleLLMButtonChange}
              >
                LLM Chat
              </button>
            </div>
            <div className="insertFile">
              <button
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "whitesmoke",
                  marginLeft: "15px",
                  marginTop: "30px",
                  paddingLeft: "220px",
                  paddingRight: "230px",
                }}
              >
                Insert Files
              </button>
            </div>
            <div className="Injested-Files">
              <div style={{ marginLeft: "15px" }}>
                <h3>Ingested Files</h3>
              </div>
              <div
                className="File-List"
                style={{
                  width: "500px",
                  height: "500px",
                  backgroundColor: "black",
                  marginLeft: "25px",
                  borderRadius: "7px",
                }}
              >
                {promptList.map((el, ind) => (
                  <div key={ind}>
                    <p>{el.dataStream}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="promptSection">
          <div
            className="promptField"
            style={{
              marginLeft: "30px",
              width: "1250px",
              height: "550px",
              backgroundColor: "black",
              borderRadius: "9px",
              padding: "10px",
              marginTop: "20px",
              paddingBottom: "40px",
            }}
          >
            <div>
              {displayData.map((el, ind) =>
                el.type === "input" ? (
                  <div
                    style={{
                      width: "850px",
                      marginLeft: "400px",
                      backgroundColor: "white",
                      color: "black",
                    }}
                    key={ind}
                  >
                    {el.dataStream}
                  </div>
                ) : (
                  <div
                    style={{
                      width: "850px",
                      marginRight: "400px",
                      backgroundColor: "white",
                      color: "black",
                    }}
                    key={ind}
                  >
                    {el.dataStream}
                  </div>
                )
              )}
            </div>
          </div>
          <div>
            <form onSubmit={queryDocAndLLM}>
              <input
                style={{
                  marginLeft: "30px",
                  width: "1150px",
                  height: "90px",
                  backgroundColor: "black",
                  borderRadius: "9px",
                  padding: "10px",
                  marginTop: "20px",
                  paddingBottom: "40px",
                }}
                type="text"
                name="query"
                value={query}
                onChange={(e) => handleQuery(e)}
              ></input>
              <button
                style={{
                  padding: "15px",
                  backgroundColor: "green",
                  borderRadius: "7px",
                  marginTop: "2px",
                }}
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
