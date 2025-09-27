export interface ChunkData {
  content: string;
  metadata: {
    filename: string,
    chunk_index: number
  };
  file_url: string;
}

const BaseAPIPath = '/api/be/api/v1/chunk';

export const getChunkData = async (id: string): Promise<ChunkData> => {
  const res = await fetch(`${BaseAPIPath}/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch chunk data');
  }
  return await res.json() as ChunkData;
}