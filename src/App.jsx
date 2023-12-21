import React, { useState, useEffect } from "react";
import defaultImage from "./assets/placeholder-image.png";
import SendLogo from "./assets/send.svg";
import { HfInference } from "@huggingface/inference";
import { blobToBase64 } from "./components/utilis";

function capitalizeFirstLetter(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function App() {
  const [textInput, setTextInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [altText, setAltText] = useState("");

  const hf = new HfInference(import.meta.env.VITE_HF_TOKEN); // Assuming you're using Create React App

  useEffect(() => {
    // Show the dialog on load
    document.getElementById("dialog-modal").showModal();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textInput.trim() || isLoading) return;

    setIsLoading(true);

    // Define the detailed base prompt
    const detailedPrompt =
      "cozy living room with fireplace, christmas tree and";

    // Combine the detailed prompt with the user's input
    const combinedPrompt = `${detailedPrompt} ${textInput}`;

    try {
      const newImageBlob = await hf.textToImage({
        model: "stabilityai/stable-diffusion-2",
        inputs: combinedPrompt,
        parameters: {
          max_tokens: 100,
          temperature: 0.7,
        },
      });

      const newImageBase64 = await blobToBase64(newImageBlob);
      setImageSrc(newImageBase64);

      document.getElementById("dialog-modal").close();

      const response = await fetch(newImageBase64);
      if (!response.ok) {
        throw new Error(`Error fetching image: ${response.statusText}`);
      }
      const imageData = await response.blob();
      const altTextResponse = await hf.imageToText({
        data: imageData,
        model: "Salesforce/blip-image-captioning-base",
      });

      setAltText(capitalizeFirstLetter(altTextResponse.generated_text));
    } catch (error) {
      console.error("Error generating alt text:", error);
      setImageSrc(defaultImage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="left-col">
        {isLoading ? (
          <div>Loading your image...</div>
        ) : (
          <div>
            <img src={imageSrc ? imageSrc : defaultImage} alt={altText} />
            <p className="image-description">{altText}</p>
          </div>
        )}
      </section>
      <section className="right-col">
        <h1>Merry Christmas!!</h1>
        <h2>And all the best for 2024</h2>
        <p>Love Andrey</p>
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
              placeholder="You are in cozy living room with fireplace, christmas tree and..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              <img src={SendLogo} className="btn-send" alt="Send" />
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}

export default App;
