import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { UserContext } from './UserContext';

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

            const fetchAchievements = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/accounts/api/users/${user.id}/achievements/`);
                const data = await response.json();

                if (data.achievements) {
                    setAchievements(data.achievements); // Если массив пустой, он просто сохранится
                } else {
                    throw new Error('Achievements data is missing.');
                }
            } catch (error) {
                console.error(error);
                setError('Не удалось загрузить достижения.');
            }
        };


            setLoading(false);
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
            const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}/edit/`, {
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
            <h1>Страница профиля</h1>
            {user ? (
                <>
                    {isEditing ? (
                        <div>
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
                        <>
                            <img
                                src={user.profile_photo || 'default-profile.png'}
                                alt="Profile"
                                className="profile-photo-large"
                            />
                            <h2>{user.username}</h2>
                            <p>Email: {user.email}</p>
                            <button onClick={() => navigate('/home')}>На главную</button>
                            <button onClick={() => setIsEditing(true)}>Редактировать</button>
                            <button className="logout-button" onClick={handleLogout}>Выйти</button>
                        </>
                    )}
                    <h2>Ваши достижения</h2>
                    {achievements.length > 0 ? (
                        <div className="achievements-container">
                            {achievements.map((achievement, index) => (
                                <div key={index} className="achievement-card">
                                    <img
                                        src={achievement.image || 'default-achievement.png'}
                                        alt={achievement.title}
                                        className="achievement-image"
                                    />
                                    <h3>{achievement.title}</h3>
                                    <p>{achievement.description}</p>
                                    <p>Получено: {new Date(achievement.date_earned).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>У вас пока нет достижений.</p>
                    )}
                </>
            ) : (
                <p>Данные профиля не найдены.</p>
            )}
        </div>
    );
};

export default Profile;
