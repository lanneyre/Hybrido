
import { GoogleGenAI, Modality } from "@google/genai";
import type { ResourceType, BloomLevel, TargetAudience } from '../types';

const friendlyResourceNames: Record<ResourceType, string> = {
    quiz: "Quiz Interactif",
    case_study: "Étude de Cas",
    infographic: "Infographie Textuelle",
    video_script: "Script de Vidéo Pédagogique",
    collaborative_activity: "Activité Collaborative",
    evaluation: "Évaluation",
    didactics: "Conseils Didactiques",
    glossary: "Glossaire"
};

const getPromptInstructions = (resourceType: ResourceType, config: any): string => {
  switch (resourceType) {
    case 'quiz':
      return `Créez un quiz avec ${config?.mcqCount ?? 3} questions à choix multiples (QCM), ${config?.trueFalseCount ?? 2} questions Vrai/Faux, et ${config?.openCount ?? 1} questions ouvertes. Pour les QCM, fournissez une seule bonne réponse et des distracteurs plausibles. Fournissez les bonnes réponses et de brèves explications. Mettez en forme en utilisant Markdown.`;
    case 'case_study':
      return "Développez une étude de cas pratique. Incluez : un scénario détaillé, un problème central, et 3 à 5 questions de discussion pour guider l'analyse. Mettez en forme avec des titres Markdown (par ex., `## Scénario`).";
    case 'infographic':
      return "Résumez les points clés sous forme d'infographie textuelle. Utilisez un titre principal, plusieurs sous-titres avec des listes à puces concises, et une phrase de conclusion. L'objectif est d'être visuellement lisible rapidement. Utilisez Markdown.";
    case 'video_script':
      return `Écrivez un script pour une vidéo pédagogique de ${config?.duration ?? 2} minutes. Divisez-le en scènes avec une narration en voix off et des suggestions de visuels à l'écran. Générez également un prompt concis et descriptif pour une IA de génération vidéo (comme Pika ou HeyGen) afin de créer un résumé visuel de la vidéo. Mettez en forme le script avec des titres Markdown pour Scène, Voix Off, Visuels, et Prompt IA Vidéo.`;
    case 'collaborative_activity':
      return `Concevez une activité collaborative pour un petit groupe. Elle devrait durer environ ${config?.duration ?? 15} minutes. Décrivez l'objectif, les instructions étape par étape, les rôles (le cas échéant), et le livrable final. Mettez en forme avec Markdown.`;
    case 'evaluation':
        return `Créez une évaluation formative pour évaluer la compréhension du contenu source. Incluez un mélange de types de questions (par ex., choix multiples, réponse courte, une tâche pratique) alignées sur les objectifs d'apprentissage clés.`;
    case 'didactics':
        return `Fournissez des conseils didactiques pour enseigner ce contenu. Identifiez les idées fausses courantes que les apprenants pourraient avoir. Suggérez des approches pédagogiques efficaces (par ex., apprentissage actif). Décrivez les précautions clés pour garantir une compréhension précise.`;
    case 'glossary':
        return `Créez un glossaire des termes clés du contenu source. Pour chaque terme, fournissez une définition claire et concise adaptée au public cible. Listez les termes par ordre alphabétique.`;
    default:
      return '';
  }
};

type SourceContent = {
    text?: string;
    image?: { data: string; mimeType: string };
};

export const generateResource = async (
  sourceContent: SourceContent,
  resourceType: ResourceType,
  bloomLevel: BloomLevel,
  targetAudience: TargetAudience,
  config: any
): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const instructions = getPromptInstructions(resourceType, config);
  const friendlyResourceName = friendlyResourceNames[resourceType];

  const prompt = `
    Vous êtes un expert en ingénierie pédagogique et en pédagogie francophone. Votre tâche est de transformer le contenu source suivant en un format pédagogique spécifique, en garantissant la rigueur scientifique. Tout le contenu généré doit être en français.

    **Instructions de base :**
    - **Public Cible :** ${targetAudience}
    - **Niveau Cognitif (Taxonomie de Bloom) :** ${bloomLevel}. La ressource générée doit cibler cette compétence cognitive spécifique.
    - **Contenu Source :**
      ---
      ${sourceContent.text || 'Une image a été fournie comme matériel source.'}
      ---

    **Détails de la tâche :**
    - **Ressource à générer :** "${friendlyResourceName}"
    - **Instructions spécifiques pour ${friendlyResourceName} :**
      ${instructions}

    Adaptez votre langage, votre ton, votre complexité et vos exemples au public cible et au niveau cognitif spécifiés. L'intégralité de la réponse doit être au format Markdown bien structuré.
  `;
  
  const contents = sourceContent.image 
    ? { parts: [ { text: prompt }, { inlineData: { data: sourceContent.image.data, mimeType: sourceContent.image.mimeType } } ]}
    : prompt;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: contents,
  });

  return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("La génération d'image a échoué ou n'a retourné aucune donnée.");
}