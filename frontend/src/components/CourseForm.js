import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState([
    { text: '', options: [{ text: '', is_correct: false }] },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [{ text: '', is_correct: false }] }]);
  };

  const addOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push({ text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, text) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, text, isCorrect) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = { text, is_correct: isCorrect };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    formData.append('questions', JSON.stringify(questions));

    try {
      const response = await fetch(`http://127.0.0.1:8000/accounts/api/courses/${id}/forms/create/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      alert(data.message || 'Ошибка при добавлении формы');
    } catch (error) {
      alert('Ошибка при отправке формы');
      console.error(error);
    }
  };

  if (!id) {
    return <div>Не указан идентификатор курса</div>;
  }

  return (
    <div>
      <h2>Добавить форму для курса</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название формы</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название формы"
          />
        </div>
        <div>
          <label>Описание формы</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание формы"
          />
        </div>
        <div>
          <label>Изображение формы</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        {questions.map((question, qIndex) => (
          <div key={qIndex}>
            <label>Вопрос {qIndex + 1}</label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              placeholder="Введите текст вопроса"
            />
            {question.options.map((option, oIndex) => (
              <div key={oIndex}>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(qIndex, oIndex, e.target.value, option.is_correct)
                  }
                  placeholder="Введите вариант ответа"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, option.text, e.target.checked)
                    }
                  />
                  Правильный
                </label>
              </div>
            ))}
            <button type="button" onClick={() => addOption(qIndex)}>
              Добавить вариант
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          Добавить вопрос
        </button>
        <button type="submit">Сохранить форму</button>
      </form>
      <button onClick={() => navigate(`/my-courses/${id}`)}>Вернуться к курсу</button>
    </div>
  );
};

export default CourseForm;