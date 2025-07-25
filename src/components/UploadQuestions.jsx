import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { database, ref, push, set, get } from "../../firebase";

const UploadQuestions = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const checkIfAdmin = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setStatus("You must be logged in to upload questions.");
      return false;
    }

    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      let isAdmin = false;

      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.email === email && user.role === "admin") {
          isAdmin = true;
        }
      });

      if (isAdmin) {
        return true;
      } else {
        setStatus("Only admins can upload questions.");
        return false;
      }
    } else {
      setStatus("User data not found.");
      return false;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    const isAdmin = await checkIfAdmin();
    if (!isAdmin) return;

    if (!file) {
      setStatus("Please select a file first!");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const questions = XLSX.utils.sheet_to_json(worksheet);

      uploadQuestionsToFirebase(questions);
    };
    reader.readAsBinaryString(file);
  };

  const uploadQuestionsToFirebase = async (questions) => {
    setStatus("Uploading questions...");

    const questionsRef = ref(database, "quiz/questions");

    const promises = questions.map(async (q) => {
      const question = {
        question: q.Question,
        choices: [q.Choice1, q.Choice2, q.Choice3, q.Choice4],
        answer: q.Answer,
        level: q.Level,
        subject: q.Subject,
      };

      const newQuestionRef = push(questionsRef);
      await set(newQuestionRef, question);
      console.log(`Uploaded question: ${q.Question}`);
    });

    await Promise.all(promises);

    setFile(null);
    setStatus("All questions uploaded successfully!");
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
        <legend className="fieldset-legend text-lg font-semibold text-primary">Upload Quiz Questions</legend>

        <label className="label">Upload .xlsx File</label>
        <input
          type="file"
          accept=".xlsx"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        <button
          className={`btn btn-neutral mt-4 w-full ${loading ? "btn-disabled" : ""}`}
          onClick={handleUpload}
        >
          {loading ? (
            <span className="loading loading-ring loading-md"></span>
          ) : (
            "Upload"
          )}
        </button>

        {status && (
          <div className="mt-4 text-sm text-info-content">
            {status}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default UploadQuestions;
