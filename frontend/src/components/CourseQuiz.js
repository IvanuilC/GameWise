import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourseQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Получаем ID пользователя из localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.id) {
      alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
      navigate('/login');
      return;
    }
    setUserId(userData.id);
  }, [navigate]);

  // Загружаем вопросы для курса
  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/accounts/api/courses/${id}/questions/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.forms && Array.isArray(data.forms)) {
          setForms(data.forms); // Устанавливаем данные форм
        } else {
          console.error('Ошибка: данные форм не получены или имеют неверный формат');
          alert('Ошибка при загрузке вопросов');
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке вопросов:', error);
        alert('Ошибка при загрузке вопросов');
      })
      .finally(() => {
        setLoading(false); // Загрузка завершена
      });
  }, [id, userId]);

  // Обработка выбора ответа
  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  // Отправка ответов на сервер
  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/accounts/api/courses/${id}/check-answers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          answers: answers,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Ошибка: ${data.error}`);
      } else {
        setScore(data.score);
        alert(`Ваш результат: ${data.correct}/${data.total} (${data.score})\nУровень: ${data.level}\nОпыт: ${data.experience}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке ответов:', error);
      alert('Ошибка при отправке ответов');
    }
  };

  // Если данные загружаются, показываем сообщение о загрузке
  if (loading) {
    return <p>Загрузка вопросов...</p>;
  }

  // Если формы не загружены, показываем сообщение об ошибке
  if (forms.length === 0) {
    return <p>Вопросы не найдены.</p>;
  }

  return (
    <div>
      <h2>Пройти тест</h2>
      {forms.map((form) => (
        <div key={form.form_id}>
          <h3>{form.title}</h3>
          <p>{form.description}</p>
          {form.image && <img src={form.image} alt={form.title} style={{ maxWidth: '100%' }} />}
          {form.questions && form.questions.length > 0 ? (
            form.questions.map((question) => (
              <div key={question.id}>
                <p>{question.text}</p>
                {question.image && <img src={question.image} alt={question.text} style={{ maxWidth: '100%' }} />}
                {question.options && question.options.length > 0 ? (
                  question.options.map((option) => (
                    <label key={option.id}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        onChange={() => handleAnswerChange(question.id, option.id)}
                      />
                      {option.text}
                      {option.image && <img src={option.image} alt={option.text} style={{ maxWidth: '100%' }} />}
                    </label>
                  ))
                ) : (
                  <p>Варианты ответов отсутствуют.</p>
                )}
              </div>
            ))
          ) : (
            <p>Вопросы отсутствуют.</p>
          )}
        </div>
      ))}
      <button onClick={handleSubmit}>Отправить ответы</button>
      <button onClick={() => navigate(`/my-courses/${id}`)}>Вернуться к курсу</button>
    </div>
  );
};

export default CourseQuiz;