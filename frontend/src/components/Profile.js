import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { UserContext } from './UserContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [achievements, setAchievements] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', profile_photo: null });
    const navigate = useNavigate();
    const { logout } = useContext(UserContext);

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('user');

            if (!storedUser) {
                setError('Пользователь не найден. Авторизуйтесь.');
                setLoading(false);
                return navigate('/login');
            }

            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({ username: userData.username, email: userData.email, profile_photo: null });

            try {
                const response = await fetch(`http://127.0.0.1:8000/accounts/api/users/${userData.id}/achievements-view/`);
                const data = await response.json();
                if (data.achievements) {
                    setAchievements(data.achievements);
                } else {
                    setError('Не удалось загрузить достижения.');
                }
            } catch (err) {
                console.error('Ошибка при загрузке достижений:', err);
                setError('Произошла ошибка при загрузке достижений.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_photo: e.target.files[0] });
    };

    const handleSave = async () => {
        if (!user) return;

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        if (formData.profile_photo) {
            formDataToSend.append('profile_photos', formData.profile_photo);
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/accounts/api/users/${user.id}/edit/`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.status === 'success') {
                alert('Профиль успешно обновлен!');
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    username: formData.username,
                    email: formData.email,
                    profile_photo: formData.profile_photo ? URL.createObjectURL(formData.profile_photo) : user.profile_photo,
                }));
                setUser({
                    ...user,
                    username: formData.username,
                    email: formData.email,
                    profile_photo: formData.profile_photo ? URL.createObjectURL(formData.profile_photo) : user.profile_photo,
                });
                setIsEditing(false);
            } else {
                alert(data.message || 'Ошибка при обновлении профиля');
            }
        } catch (error) {
            alert('Ошибка при отправке данных на сервер');
            console.error(error);
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="profile-container">
            <Navbar />
            {user ? (
                <div className="profile-content">
                    <img
                        src={user.profile_photo || 'default-profile.png'}
                        alt="Profile"
                        className="profile-photo"
                    />
                    {isEditing ? (
                        <div className="edit-form">
                            <label>
                                Имя пользователя:
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Фото профиля:
                                <input
                                    type="file"
                                    name="profile_photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <button onClick={handleSave}>Сохранить</button>
                            <button onClick={() => setIsEditing(false)}>Отмена</button>
                        </div>
                    ) : (
                        <div className="profile-details">
                            <h2>{user.username}</h2>
                            <p>Email: {user.email}</p>
                            <div className="profile-buttons">
                                <button className="logout-button" onClick={() => navigate(`/home`)}>На главную</button>
                                <button className="logout-button" onClick={() => setIsEditing(true)}>Редактировать</button>
                                <button className="logout-button" onClick={handleLogout}>Выйти</button>
                            </div>
                        </div>
                    )}
                    <h2>Ваши достижения</h2>
                    {achievements.length > 0 ? (
                        <div className="achievements-container">
                            {achievements.map((achievement) => (
                                <div key={achievement.id} className="achievement-card">
                                    <h3>{achievement.title}</h3>
                                    <p>{achievement.description}</p>
                                    <p>Получено: {new Date(achievement.date_earned).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>У вас пока нет достижений.</p>
                    )}
                </div>
            ) : (
                <p>Данные профиля не найдены.</p>
            )}
            <Footer />
        </div>
    );
};

export default Profile;
