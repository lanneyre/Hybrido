
import { GoogleGenAI, Modality, Type } from "@google/genai";
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

const getPedagogicalWarning = (level: BloomLevel): string => {
    switch (level) {
        case 'remember': return "Le niveau ‘Se souvenir’ favorise la mémorisation mais non la compétence réflexive. Complétez cette activité avec un exercice d’analyse ou d’évaluation authentique.";
        case 'understand': return "Le niveau ‘Comprendre’ est fondamental, mais encouragez les apprenants à passer à l'application pratique des concepts.";
        case 'apply': return "Le niveau ‘Appliquer’ ancre les connaissances dans la pratique. Assurez-vous que les scénarios sont pertinents pour les apprenants.";
        case 'analyze': return "Le niveau ‘Analyser’ développe la pensée critique. Fournissez des cadres ou des modèles pour guider l'analyse.";
        case 'evaluate': return "Le niveau ‘Évaluer’ demande un jugement argumenté. Clarifiez les critères d'évaluation pour guider la réflexion.";
        case 'create': return "Le niveau ‘Créer’ est le plus exigeant. Offrez un soutien et des ressources suffisantes pour encourager l'innovation.";
        default: return "";
    }
};

const getPromptInstructions = (resourceType: ResourceType, config: any): string => {
  switch (resourceType) {
    case 'quiz':
      return `Créez un quiz avec ${config?.mcqCount ?? 3} questions à choix multiples (QCM), ${config?.trueFalseCount ?? 2} questions Vrai/Faux, et ${config?.openCount ?? 1} questions ouvertes. Pour les QCM, fournissez une seule bonne réponse et des distracteurs plausibles. Fournissez les bonnes réponses et de brèves explications. Mettez en forme en utilisant Markdown.`;
    case 'case_study':
      return "Développez une étude de cas pratique. Incluez : un scénario détaillé, un problème central, et 3 à 5 questions de discussion pour guider l'analyse. Mettez en forme avec des titres Markdown (par ex., `### Scénario`).";
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
    file?: { data: string; mimeType: string; name: string };
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
  const pedagogicalWarning = getPedagogicalWarning(bloomLevel);

  const systemInstruction = `
Tu es **Hybrido**, un assistant d’ingénierie pédagogique intelligent spécialisé dans la création de ressources éducatives multimodales.
Ta mission : transformer un contenu source fourni en ressources pédagogiques complètes, structurées et cohérentes, alignées sur la Taxonomie de Bloom, le public cible, et les objectifs d’apprentissage.

Tu réponds toujours en français dans un style clair, professionnel et structuré. Tu appliques rigoureusement les principes de conception pédagogique et la rigueur scientifique dans chaque génération.

### Raisonnement interne
Avant de générer, analyse le contenu source. S'il est insuffisant pour atteindre le niveau de Bloom demandé, tu DOIS répondre UNIQUEMENT avec le message suivant et rien d'autre : "Le contenu actuel ne permet pas d’atteindre le niveau ‘${bloomLevel}’. Merci d’ajouter un contenu complémentaire ou de choisir un niveau inférieur."

### Structure de sortie attendue
Chaque production doit être un document Markdown complet et directement exploitable, structuré impérativement comme suit :

1.  **Titre de la ressource** : Commence par un titre de niveau 2 (##) ex: \`## ${friendlyResourceName} : [Sujet du contenu]\`.
2.  **Objectifs Pédagogiques** : Liste les objectifs d'apprentissage alignés sur le niveau de Bloom. Utilise des verbes d'action appropriés.
3.  **Contenu de la ressource** : C'est le corps principal de ta réponse (le quiz, le script, etc.). Suis les instructions spécifiques à la ressource.
4.  **Pour aller plus loin** : Propose des suggestions, une brève bibliographie au format APA, et/ou des liens pour approfondir le sujet.
5.  **Mise en garde pédagogique** : Inclus la mise en garde textuellement : "${pedagogicalWarning}"
6.  **Mention de validation** : Termine TOUJOURS par cette mention exacte : "Cette ressource nécessite une validation pédagogique avant diffusion, conformément aux bonnes pratiques de la formation."
`;

  const userPrompt = `
    **Contenu Source :**
    ---
    ${sourceContent.text || (sourceContent.file ? `Un fichier nommé "${sourceContent.file.name}" a été fourni comme matériel source.` : 'Aucun contenu textuel fourni.')}
    ---

    **Détails de la tâche :**
    - **Public Cible :** ${targetAudience}
    - **Niveau Cognitif (Taxonomie de Bloom) :** ${bloomLevel}
    - **Ressource à générer :** "${friendlyResourceName}"
    - **Instructions spécifiques pour ${friendlyResourceName} :**
      ${instructions}
  `;
  
  const contents = sourceContent.file 
    ? { parts: [ { text: userPrompt }, { inlineData: { data: sourceContent.file.data, mimeType: sourceContent.file.mimeType } } ]}
    : userPrompt;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: contents,
    config: {
        systemInstruction: systemInstruction,
    }
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


const getJsonSchemaForResource = (resourceType: 'quiz' | 'glossary') => {
    if (resourceType === 'quiz') {
        return {
            type: Type.OBJECT,
            properties: {
                quiz: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['QCM', 'Vrai/Faux', 'Ouverte'] },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                         required: ['question', 'type', 'answer']
                    }
                }
            }
        };
    }
    if (resourceType === 'glossary') {
        return {
            type: Type.OBJECT,
            properties: {
                glossary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: { type: Type.STRING },
                            definition: { type: Type.STRING },
                        },
                        required: ['term', 'definition']
                    }
                }
            }
        }
    }
    return {};
};


export const convertMarkdownToStructuredJson = async (
    markdownContent: string,
    resourceType: 'quiz' | 'glossary'
): Promise<any> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schema = getJsonSchemaForResource(resourceType);

    const prompt = `Convertis le contenu Markdown suivant d'un ${resourceType} en un objet JSON structuré. Assure-toi de respecter le schéma fourni. Extrait uniquement la section pertinente (par exemple, la liste des questions du quiz ou la liste des termes du glossaire) du Markdown et ignore les titres, les objectifs, les avertissements et autres métadonnées.\n\nContenu Markdown:\n---\n${markdownContent}\n---`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });
    
    try {
        // La réponse textuelle devrait déjà être une chaîne JSON, mais un nettoyage peut être nécessaire.
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", e);
        console.error("Raw AI response:", response.text);
        throw new Error("La conversion du contenu en format structuré a échoué.");
    }
};