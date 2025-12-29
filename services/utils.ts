/**
 * @file utils.ts
 * @description Utility functions for multimedia file conversion.
 * Gemini API expects images and audio as Base64 encoded strings within the JSON payload.
 * These functions convert browser File/Blob objects into the required format.
 */

/**
 * Converts a browser File object to the GenerativePart format for Gemini.
 * @param {File} file - Image file from input.
 * @returns {Promise<Object>} Object containing MIME type and base64 data.
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader returns "data:image/png;base64,XXXX", we only need the "XXXX" part.
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a recording Blob to a Base64 string.
 * @param {Blob} blob - Recorded audio data.
 * @returns {Promise<string>} Pure base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Extracts the raw base64 string from the DataURL.
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};