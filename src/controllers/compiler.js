const axios = require("axios");

const executeCode = async (req, res) => {
  const { code, language } = req.body;

  // Expanded Language Map
  const runtimeMap = {
    "javascript": { version: "18.15.0", language: "javascript" },
    "python": { version: "3.10.0", language: "python" },
    "java": { version: "15.0.2", language: "java" },
    "c++": { version: "10.2.0", language: "c++" },
    "go": { version: "1.16.2", language: "go" }
  };

  const runtime = runtimeMap[language];

  if (!runtime) {
    return res.status(400).json({ output: "Unsupported Language" });
  }

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: runtime.language,
      version: runtime.version,
      files: [{ content: code }],
    });
    res.json({ output: response.data.run.output });
  } catch (error) {
    res.status(500).json({ output: "Execution Error: " + error.message });
  }
};

module.exports = { executeCode };