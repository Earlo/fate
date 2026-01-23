type SheetMeta = {
  id?: string;
  owner?: string;
  created?: Date;
  updated?: Date;
};

export const stripSheetMeta = <T extends SheetMeta>(sheet: T) => {
  const { id, owner, created, updated, ...rest } = sheet;
  void id;
  void owner;
  void created;
  void updated;
  return rest;
};

const getLineColumn = (text: string, position: number) => {
  const lines = text.slice(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
};

export const cleanJsonText = (text: string) => {
  let cleaned = text.replace(/^\uFEFF/, '').trim();
  const fenceMatch = cleaned.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  return cleaned;
};

export const parseJsonWithDetails = (text: string) => {
  try {
    return { parsed: JSON.parse(text), error: null };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const positionMatch = rawMessage.match(/position (\d+)/i);
    if (positionMatch) {
      const position = Number(positionMatch[1]);
      const { line, column } = getLineColumn(text, position);
      const snippetStart = Math.max(0, position - 40);
      const snippetEnd = Math.min(text.length, position + 40);
      const snippet = text.slice(snippetStart, snippetEnd);
      return {
        parsed: null,
        error: `Invalid JSON at line ${line} column ${column}. Near: "${snippet}"`,
      };
    }
    const lineColumnMatch = rawMessage.match(/line (\d+) column (\d+)/i);
    if (lineColumnMatch) {
      const line = Number(lineColumnMatch[1]);
      const column = Number(lineColumnMatch[2]);
      const lineText = text.split('\n')[line - 1] ?? '';
      return {
        parsed: null,
        error: `Invalid JSON at line ${line} column ${column}. Line: "${lineText}"`,
      };
    }
    return { parsed: null, error: `Invalid JSON. ${rawMessage}` };
  }
};

export const readJsonFile = async (file: File) => {
  const text = await file.text();
  const cleanedText = cleanJsonText(text);
  if (!cleanedText) {
    return { parsed: null, error: 'Imported file is empty.' };
  }
  const { parsed, error } = parseJsonWithDetails(cleanedText);
  if (error) {
    return { parsed: null, error };
  }
  return { parsed, error: null };
};

export const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
