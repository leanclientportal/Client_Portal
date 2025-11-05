'use server';

/**
 * @fileOverview Generates a client profile picture using AI based on the client's name.
 *
 * - generateClientProfilePicture - A function that generates a profile picture for a client.
 * - GenerateClientProfilePictureInput - The input type for the generateClientProfilePicture function.
 * - GenerateClientProfilePictureOutput - The return type for the generateClientProfilePicture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClientProfilePictureInputSchema = z.object({
  clientName: z
    .string()
    .describe('The name of the client for whom to generate a profile picture.'),
});

export type GenerateClientProfilePictureInput = z.infer<
  typeof GenerateClientProfilePictureInputSchema
>;

const GenerateClientProfilePictureOutputSchema = z.object({
  profilePictureDataUri: z
    .string()
    .describe(
      'A data URI containing the generated profile picture image in PNG format with base64 encoding.'
    ),
});

export type GenerateClientProfilePictureOutput = z.infer<
  typeof GenerateClientProfilePictureOutputSchema
>;

export async function generateClientProfilePicture(
  input: GenerateClientProfilePictureInput
): Promise<GenerateClientProfilePictureOutput> {
  return generateClientProfilePictureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClientProfilePicturePrompt',
  input: {schema: GenerateClientProfilePictureInputSchema},
  output: {schema: GenerateClientProfilePictureOutputSchema},
  prompt: `Generate a profile picture for a client named "{{{clientName}}}". The image should be a simple avatar with the initials of the client's name on a colored background.  Return the image as a data URI in PNG format with base64 encoding.`,
});

const generateClientProfilePictureFlow = ai.defineFlow(
  {
    name: 'generateClientProfilePictureFlow',
    inputSchema: GenerateClientProfilePictureInputSchema,
    outputSchema: GenerateClientProfilePictureOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a profile picture for a client named "${input.clientName}". The image should be a simple avatar with the initials of the client's name on a colored background.`,    
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate profile picture.');
    }

    return {profilePictureDataUri: media.url};
  }
);
