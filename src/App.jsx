import React, { useState, useEffect } from "react";
import defaultImage from "./assets/placeholder-image.png";
import SendLogo from "./assets/send.svg";
import { HfInference } from "@huggingface/inference";

function App() {
  const [textInput, setTextInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const hf = new HfInference(import.meta.env.VITE_HF_TOKEN); // Assuming you're using Create React App

  useEffect(() => {
    // Show the dialog on load
    document.getElementById("dialog-modal").showModal();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textInput.trim()) return;

    try {
      const newImageBlob = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2",
        inputs: textInput,
        parameters: {
          max_tokens: 100,
          temperature: 0.5,
        },
      });

      const newImageBase64 = await blobToBase64(newImageBlob);
      setImageSrc(newImageBase64);

      document.getElementById("dialog-modal").close();
    } catch (error) {
      console.error("Error generating image:", error);
      setImageSrc("Error generating image");
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <main>
      <section className="left-col">
        <img src={imageSrc ? imageSrc : defaultImage} alt="Generated" />
      </section>
      <section className="right-col">
        <h1>Merry Christmas!!</h1>
        <h2>And all the best for 2024</h2>
        <p>Love Andrej</p>
      </section>
      <dialog id="dialog-modal">
        <form onSubmit={handleSubmit}>
          <label>Describe a Christmassy image for your e-card 🎄</label>
          <div className="form-inner">
            <textarea
              placeholder="A winter scene..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button type="submit">
              <img src={SendLogo} className="btn-send" alt="Send" />
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}

export default App;
