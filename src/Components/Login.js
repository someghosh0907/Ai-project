import React from "react";
//import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
//import { authActions } from '../store';

const Login = () => {
  const navigate = useNavigate();
  //const dispatch = useDispatch();
  //state
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  //handle input change
  /*const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };*/

  //form handle
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/user/login", {
        email: inputs.email,
        password: inputs.password,
      });
      if (data?.success) {
        //localStorage.setItem("userId", data?.user._id);
        //dispatch(authActions.login());
        //toast.success("User login Successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      alert("Please Register Before Logging In!!!!");
    }
  }
  return (
    <div className="top" style={{marginLeft:"700px"}}>
      <form onSubmit={handleSubmit}>
        <div
          className="content"
          style={{
            display:"block",
            backgroundColor: "pink",
            width: "420px",
            height: "470px",
            justifyContent: "center",
            alignItems:"center",
            borderRadius: "10px",
            boxShadow: "400",
            top: "30px",
            margin: "40px",
          }}
        >
          <p style={{ color: "black", fontSize: "16px" ,justifyContent:"center",paddingLeft:"170px",paddingTop:"20px"}}>
            <h2>Login</h2>
          </p>
          <input
            type="email"
            value={inputs.email}
            placeholder="E-Mail"
            style={{ borderRadius: "7px",backgroundColor:"whitesmoke",height:"40px",width:"386px",marginBottom:"10px",marginTop:"20px",paddingLeft:"20px" }}
            onChange={(e)=>setInputs(e.target.value)}
          ></input>
          <br/>
          <input
            type="password"
            value={inputs.password}
            placeholder="Password"
            style={{ borderRadius: "7px",backgroundColor:"whitesmoke",height:"40px",width:"386px",marginBottom:"10px" ,paddingLeft:"20px"}}
            onChange={(e)=>setInputs(e.target.value)}
          ></input>
          <br />
          <button
            type="submit"
            style={{
              backgroundColor: "#00FF00",
              padding: "15px 85px",
              borderRadius: "7px",
              marginLeft:"100px"
            }}
          >
            Login
          </button>
          <br />
          <p style={{ color: "black", fontSize: "16px" ,marginLeft:"100px" }} onClick={navigate('/register')}>
            Not Registered?? <span style={{ color: "blue"}}>Register</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
