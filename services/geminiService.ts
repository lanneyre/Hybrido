
import { GoogleGenAI } from "@google/genai";
import type { ResourceType, Complexity } from '../types';

const getResourceTypeFriendlyName = (resourceType: ResourceType): string => {
    const names = {
        quiz: "Interactive Quiz",
        case_study: "Case Study",
        infographic: "Textual Infographic",
        video_script: "Pedagogical Video Script",
        collaborative_activity: "Collaborative Activity"
    };
    return names[resourceType];
}

const getPromptInstructions = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case 'quiz':
      return "Create a 5-question multiple-choice quiz. Each question should have one correct answer and three plausible distractors. After each question, provide the correct answer with a brief explanation. Format the output clearly using Markdown (e.g., use `**` for questions and `-` for options).";
    case 'case_study':
      return "Develop a practical case study based on the source content. The case study should include: a detailed scenario, a central problem or challenge to be solved, and a set of 3-5 discussion questions to guide analysis and application of the concepts. Format the output using Markdown with clear headings for each section (e.g., `## Scenario`).";
    case 'infographic':
      return "Summarize the key points of the source text into a textual infographic format. Use a main title, several subheadings with concise bullet points under each, and a concluding summary sentence. The goal is to present the information in a visually scannable and digestible way. Use Markdown for structure.";
    case 'video_script':
      return "Write a script for a 2-3 minute educational video. The script should be divided into scenes. For each scene, provide the voiceover narration and suggestions for on-screen visuals (e.g., text, graphics, animations). Format the script clearly using Markdown, with headings for `## Scene X`, `**Voiceover:**`, and `**Visuals:**`.";
    case 'collaborative_activity':
      return "Design a collaborative activity for a small group of 3-4 learners. The activity should be based on the provided content. Describe the main objective, the step-by-step instructions for the group, the roles of each participant (if any), and the final deliverable or outcome. Format using Markdown with clear headings.";
    default:
      return '';
  }
};

export const generateResource = async (
  sourceText: string,
  resourceType: ResourceType,
  complexity: Complexity
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const instructions = getPromptInstructions(resourceType);
  const friendlyResourceName = getResourceTypeFriendlyName(resourceType);

  const prompt = `
    You are an expert in instructional design and pedagogy, specializing in creating multimodal learning resources. 
    Your task is to transform the following source content into a specific educational format while preserving its scientific accuracy and rigor.

    **Source Content:**
    ---
    ${sourceText}
    ---

    **Task:**
    Generate a "${friendlyResourceName}".

    **Complexity Level:**
    The target audience is at a "${complexity}" level. Adapt the language, depth of questions, and concepts accordingly.

    **Specific Instructions for ${friendlyResourceName}:**
    ${instructions}

    Ensure the final output is well-structured, engaging, and pedagogically sound. The entire response must be in Markdown format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text;
};
