import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { FaHandshake } from "react-icons/fa6";
const Register = () => {
  const navigate = useNavigate();
  //state
  const [inputs, setInputs] = useState({
    name: "",
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
      const { data } = await axios.post(
        "http://localhost:3400/api/v1/user/register",
        {
          username: inputs.name,
          email: inputs.email,
          password: inputs.password,
        }
      );
      if (data?.success) {
        //toast.success("User Register Successfully");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit} style={{ marginLeft: "700px" }}>
        <div
          className="content"
          style={{
            display: "block",
            backgroundColor: "pink",
            width: "420px",
            height: "470px",
            justifyContent: "center",
            borderRadius: "10px",
            boxShadow: "400",
            top: "30px",
            margin: "40px",
          }}
        >
          <br />
          <span
            style={{
              color: "black",
              fontSize: "16px",
              justifyContent: "center",
              paddingLeft: "170px",
              paddingTop: "20px",
            }}
          >
            <h2>Register</h2>
          </span>
          <input
            type="text"
            value={inputs.name}
            onChange={(e) => setInputs(e.target.value)}
            placeholder="UserName"
            style={{
              borderRadius: "7px",
              backgroundColor: "whitesmoke",
              height: "40px",
              width: "386px",
              marginBottom: "10px",
              marginTop: "20px",
              paddingLeft: "20px",
            }}
          ></input>
          <br />
          <input
            type="email"
            value={inputs.email}
            onChange={(e) => setInputs(e.target.value)}
            placeholder="E-Mail"
            style={{
              borderRadius: "7px",
              backgroundColor: "whitesmoke",
              height: "40px",
              width: "386px",
              marginBottom: "10px",
              marginTop: "20px",
              paddingLeft: "20px",
            }}
          ></input>
          <br />
          <span
            style={{ color: "black", fontSize: "16px", width: "50px" }}
          ></span>
          <input
            type="password"
            value={inputs.password}
            onChange={(e) => setInputs(e.target.value)}
            placeholder="Password"
            style={{
              borderRadius: "7px",
              backgroundColor: "whitesmoke",
              height: "40px",
              width: "386px",
              marginBottom: "10px",
              marginTop: "20px",
              paddingLeft: "20px",
            }}
          ></input>
          <br />
          <button
            type="submit"
            style={{
              backgroundColor: "#00FF00",
              padding: "15px 85px",
              borderRadius: "7px",
              marginLeft: "100px",
            }}
          >
            Register
          </button>
          <br />
          <p style={{ color: "black", fontSize: "16px",marginLeft:"100px" }} nClick={navigate('/login')}>
            Already Registered?? <span style={{ color: "blue" }}>Login</span>
          </p>
        </div>
      </form>
    </>
  );
};

export default Register;
