import { useState } from "react";
import { api } from "../api";

function Quiz() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});

  const start = async () => {
    const ch = JSON.parse(localStorage.getItem("chapter"));
    const res = await api.getQuiz(ch.content);
    setQuiz(res.quiz);
  };

  const submit = async () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    await api.saveProgress("student1", score);
    alert(`Score: ${score}/${quiz.length}`);
  };

  return (
    <div>
      <div className="header">
        <h2>🧠 Quiz</h2>
      </div>

      <div className="card">
        <button onClick={start}>Start Quiz</button>

        {quiz.map((q, i) => (
          <div key={i}>
            <p><b>{q.question}</b></p>

            {q.options.map(opt => (
              <div key={opt}>
                <input
                  type="radio"
                  name={i}
                  onChange={() =>
                    setAnswers({ ...answers, [i]: opt })
                  }
                />
                {opt}
              </div>
            ))}
          </div>
        ))}

        {quiz.length > 0 && <button onClick={submit}>Submit</button>}
      </div>
    </div>
  );
}

export default Quiz;