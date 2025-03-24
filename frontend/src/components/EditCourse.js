import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './EditCourse.css';

const EditCourse = () => {
  const { id } = useParams(); // Изменено с course_id на id
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    tags: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Загрузка данных пользователя
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(storedUser);
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
      }
    };

    // Загрузка данных курса для редактирования
    const fetchCourse = async () => {
      try {
        if (!id) {
          throw new Error('ID курса не определен');
        }

        const response = await axios.get(`http://127.0.0.1:8000/accounts/api/courses/${id}/edit/`);

        if (!response.data) {
          throw new Error('Данные курса не получены');
        }

        setCourse({
          title: response.data.title || '',
          description: response.data.description || '',
          tags: response.data.tags || '',
          content: response.data.content || ''
        });
      } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        setError(error.message || 'Не удалось загрузить данные курса для редактирования');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    fetchCourse();
  }, [id]); // Зависимость изменена на id

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert('Вы должны быть авторизованы для редактирования курса.');
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/accounts/api/courses/${id}/edit/`,
        course,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/courses/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Ошибка при обновлении курса:', error);
      setError(error.response?.data?.error || 'Не удалось обновить курс. Попробуйте позже.');
    }
  };

  if (loading) {
    return (
      <div className="edit-course">
        <Navbar />
        <div className="loading">Загрузка данных курса...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-course">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="edit-course">
      <Navbar />
      <div className="edit-course-container">
        <h1>Редактирование курса</h1>

        {success && (
          <div className="success-message">
            Курс успешно обновлен! Вы будете перенаправлены на страницу курса.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Название курса:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={course.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание курса:</label>
            <textarea
              id="description"
              name="description"
              value={course.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Теги (через запятую):</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={course.tags}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Содержание курса:</label>
            <textarea
              id="content"
              name="content"
              value={course.content}
              onChange={handleInputChange}
              required
              rows="10"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Сохранить изменения
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(`/courses/${id}`)}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditCourse;