import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Загрузка данных курса
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/accounts/api/course/${id}/`);

        if (!response.data) {
          throw new Error('Данные курса не получены');
        }

        setCourse({
          ...response.data,
          author: response.data.author || {} // Защита от отсутствия автора
        });
      } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        setError('Не удалось загрузить данные курса');
      } finally {
        setLoading(false);
      }
    };

    // Загрузка данных пользователя
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(storedUser);
      } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
      }
    };

    fetchCourse();
    loadUser();
  }, [id]);

  // Проверка прав на редактирование с защитой от undefined
  const canEditCourse = () => {
    if (!user || !course || !course.author) return false;
    return user.is_superuser || user.id === course.author.id;
  };

  const handleEnroll = async () => {
    if (!user?.id) {
      alert('Вы должны быть авторизованы, чтобы записаться на курс.');
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/accounts/api/courses/${id}/enroll/`,
        { user_id: user.id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      alert(response.data.message || 'Вы успешно записаны на курс');
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                         error.response?.data?.detail ||
                         'Ошибка при записи на курс. Попробуйте позже.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="course-detail">
        <Navbar />
        <div className="loading">Загрузка данных курса...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail">
        <Navbar />
        <div className="error-message">Курс не найден</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="course-detail">
      <Navbar />
      <div className="course-content">
        <div className="course-header">
          <h1>{course.title || 'Без названия'}</h1>

          {canEditCourse() && (
            <Link
              to={`/courses/${course.id}/edit`}
              className="edit-course-button"
            >
              Редактировать курс
            </Link>
          )}
        </div>

        <p>{course.description || 'Описание отсутствует'}</p>

        <h2>Содержание курса:</h2>
        <div className="course-content-details">
          {course.content || 'Содержание пока не добавлено'}
        </div>

        <button
          className="in-course-button"
          onClick={handleEnroll}
          disabled={!user?.id}
        >
          {user?.id ? 'Записаться на курс' : 'Войдите для записи'}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;