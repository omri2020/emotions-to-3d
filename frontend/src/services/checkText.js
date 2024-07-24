import axios from "axios";

const API_KEY = "AIzaSyCWJTagthX7gehzUJryJkuqyTPnV6Zx0fE"; // Replace with your actual API key

export const checkText = async (text) => {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;
  const data = {
    comment: { text },
    languages: ["en"],
    requestedAttributes: { TOXICITY: {} },
  };

  try {
    const response = await axios.post(url, data);
    const toxicity = response.data.attributeScores.TOXICITY.summaryScore.value;
    return toxicity > 0.7; // Adjust the threshold as needed
  } catch (error) {
    console.error("Error checking text:", error);
    return false;
  }
};
