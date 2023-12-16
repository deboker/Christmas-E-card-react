import React, { useState, useEffect } from "react";
import defaultImage from "./assets/placeholder-image.png";
import SendLogo from "./assets/send.svg";
import { HfInference } from "@huggingface/inference";

function App() {
  const [textInput, setTextInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hf = new HfInference(import.meta.env.VITE_HF_TOKEN); // Assuming you're using Create React App

  useEffect(() => {
    // Show the dialog on load
    document.getElementById("dialog-modal").showModal();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textInput.trim()) return;

    setIsLoading(true);

    // Define the detailed base prompt
    const detailedPrompt =
      "Create a highly detailed, cozy, festive Christmas scene: " +
      "A warmly lit living room on a snowy evening, with a beautifully decorated Christmas tree, " +
      "stockings hanging from the fireplace, and presents wrapped in shiny, colorful paper. " +
      "The scene should radiate warmth and joy, capturing the essence of a family Christmas celebration. " +
      "The atmosphere should be filled with warm colors, a sense of festive cheer, and soft, inviting lighting.";

    // Combine the detailed prompt with the user's input
    const combinedPrompt = `${textInput} ${detailedPrompt} `;

    try {
      const newImageBlob = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2",
        inputs: combinedPrompt,
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

    setIsLoading(false);
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
        {isLoading ? (
          <div>Loading your image...</div>
        ) : (
          <img src={imageSrc ? imageSrc : defaultImage} alt="Generated" />
        )}
      </section>
      <section className="right-col">
        <h1>Merry Christmas!!</h1>
        <h2>And all the best for 2024</h2>
        <p>Love Andrej</p>
      </section>
      <dialog id="dialog-modal">
        <form onSubmit={handleSubmit}>
          <label>
            {isLoading
              ? "Loading your image..."
              : "Describe a Christmassy image for your e-card 🎄"}
          </label>
          <div className="form-inner">
            <textarea
              placeholder="A santa winter scene..."
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
