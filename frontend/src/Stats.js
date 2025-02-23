import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const Stats = ({ notes, categories }) => {
    const getNotesByMonth = () => {
        const notesByMonth = Array(12).fill(0);
        notes.forEach(note => {
            const date = new Date(note.id);
            const month = date.getMonth();
            notesByMonth[month]++;
        });
        return notesByMonth;
    };

    const getNotesByCategory = () => {
        const categoryStats = {};
        categories.forEach(category => {
            categoryStats[category] = notes.filter(note => note.category === category).length;
        });
        return categoryStats;
    };

    const getNotesByPriority = () => {
        const priorities = { Haute: 0, Moyenne: 0, Basse: 0 };
        notes.forEach(note => {
            if (note.priority in priorities) {
                priorities[note.priority]++;
            }
        });
        return priorities;
    };

    return (
        <div className="stats-container">
            <div className="chart">
                <h3>Notes par Mois</h3>
                <Bar
                    data={{
                        labels: [
                            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                        ],
                        datasets: [
                            {
                                label: 'Notes',
                                data: getNotesByMonth(),
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'Notes par Mois' },
                        },
                    }}
                />
            </div>

            <div className="chart">
                <h3>Catégories</h3>
                <Pie
                    data={{
                        labels: Object.keys(getNotesByCategory()),
                        datasets: [
                            {
                                data: Object.values(getNotesByCategory()),
                                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: true, text: 'Répartition des Catégories' },
                        },
                    }}
                />
            </div>

            <div className="chart">
                <h3>Priorités</h3>
                <Pie
                    data={{
                        labels: ['Haute', 'Moyenne', 'Basse'],
                        datasets: [
                            {
                                data: Object.values(getNotesByPriority()),
                                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcf6b'],
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: true, text: 'Répartition des Priorités' },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default Stats;
