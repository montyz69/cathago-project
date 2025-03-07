const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const xlsx = require("xlsx");
const csvParser = require("csv-parser");

const extractTextFromFile = async (fileBlob, fileType) => {
  try {
    let fileBuffer;
    if (Buffer.isBuffer(fileBlob)) {
      fileBuffer = fileBlob;
    } else if (fileBlob instanceof Blob) {
      fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
    } else {
      throw new Error("Invalid fileBlob type. Expected Buffer or Blob.");
    }

    if (fileType === "pdf" || fileType === "application/pdf") {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else if (fileType === "xlsx" || fileType === "xls") {
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      let text = "";
      workbook.SheetNames.forEach((sheet) => {
        text += xlsx.utils.sheet_to_csv(workbook.Sheets[sheet]) + "\n";
      });
      return text;
    } else if (fileType === "csv") {
      return new Promise((resolve, reject) => {
        let text = "";
        require("stream")
          .Readable.from(fileBuffer.toString())
          .pipe(csvParser())
          .on("data", (row) => {
            text += Object.values(row).join(" ") + "\n";
          })
          .on("end", () => resolve(text))
          .on("error", (err) => reject(err));
      });
    } else if (fileType === "txt") {
      return fileBuffer.toString("utf8");
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error extracting text:`, error);
    return "";
  }
};
module.exports = { extractTextFromFile };
