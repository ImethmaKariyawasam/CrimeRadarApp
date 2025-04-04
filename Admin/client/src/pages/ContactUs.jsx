import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiCheck } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useSelector } from "react-redux";
export default function ContactUs() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const defaultUserId = currentUser ? currentUser._id : "UnregisteredUser";
  const [formData, setFormData] = useState({
    userid: defaultUserId,
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message ||
      !formData.userid
    ) {
      toast.error("Please fill out all the fields");
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("api/inquiry/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      setLoading(false);
      setSuccessMessage("Your Inquiry is Submitted Successfully!");
      //toast.success("Your Inquiry is Submitted Successfully!");
      setFormData({});
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later");
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="min-h-screen mt-20">
        <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
          {/*left*/}
          <div className="flex-1">
            <Link to="/" className="font-bold dark:text-white text-4xl">
              <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
               Crime
              </span>
              Radar Support
            </Link>
            <p className="text-sm mt-5">
              Please Submit your Inquiry and we will get back to you as soon as
              possible.
            </p>
          </div>
          {/*right*/}
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="Your Name" />
                <TextInput
                  type="text"
                  placeholder="Name"
                  id="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label value="Your Email" />
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label value="Your Phone Number" />
                <TextInput
                  type="number"
                  placeholder="+94 70 100 0000"
                  id="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
                <Label value="Your Message" />
                <Textarea
                  placeholder="Your Message"
                  id="message"
                  value={formData.message || ""}
                  onChange={handleChange}
                />
              </div>
              <Button
                gradientDuoTone="purpleToPink"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading....</span>
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </Button>
            </form>
            {successMessage && (
              <Alert color="success" className="mt-5">
                {successMessage}
              </Alert>
            )}
            <div className=" flex gap-2 text-sm mt-5">
              <span>More Questions?</span>
              <Link to="#" className=" text-blue-500">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
