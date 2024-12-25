import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Achievements = ({ userId }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/user/${userId}/achievements/`)
            .then((response) => {
                setAchievements(response.data.achievements);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching achievements:", error);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="achievements">
            <h2>Your Achievements</h2>
            <ul>
                {achievements.map((achievement, index) => (
                    <li key={index}>
                        {achievement.image && <img src={achievement.image} alt={achievement.title} />}
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                        <small>Earned on: {new Date(achievement.date_earned).toLocaleDateString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Achievements;
