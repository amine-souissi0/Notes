import React, { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import "./App.css";
import imageCompression from 'browser-image-compression';
import { openDB } from 'idb';
import { Divider } from "@mui/material";
import { FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatBold } from "@mui/icons-material";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import jsPDF from "jspdf";
import htmlToPdfmake from "html-to-pdfmake";
import Stats from "./Stats";
import ChatBot from "./ChatBot";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
  
} from 'chart.js';



// Enregistrement des composants de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement);

const categories = ["Travail", "Personnel", "Idées", "Urgent", "Autres"];
const exportNoteToPDF = (noteId) => {
    const noteElement = document.getElementById(`note-${noteId}`);
    if (!noteElement) return;

    const pdf = new jsPDF();
    const html = noteElement.innerHTML; // Récupère le contenu HTML de la note
    const pdfContent = htmlToPdfmake(html); // Convertit le HTML en contenu PDF
    pdf.html(noteElement, {
        callback: function (pdf) {
            pdf.save(`note-${noteId}.pdf`);
        },
    });
};
const App = () => {
    const [notes, setNotes] = useState(() => {
        const savedNotes = localStorage.getItem("userNotes");
        try {
            return savedNotes
                ? JSON.parse(savedNotes)
                : [
                      { id: 1, title: "Bienvenue", content: "Ceci est votre première note.", color: "#000000", category: "Autres", reminder: "", priority: "Moyenne", attachments: [] },
                      { id: 2, title: "Note Exemple", content: "Ajoutez un rappel !", color: "#000000", category: "Travail", reminder: "", priority: "Haute", attachments: [] },
                  ];
        } catch (e) {
            console.error("Error parsing notes from localStorage:", e);
            return [];
        }
    });

    
    const themes = ["light", "dark", "blue", "pink", "green", "purple", "orange", "yellow"];

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        return savedTheme;
    });
    
    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };
    

    const [filter, setFilter] = useState("Toutes");
    const [sortBy, setSortBy] = useState("date");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        localStorage.setItem("userNotes", JSON.stringify(notes));
        syncWithIndexedDB();
    }, [notes]);

    useEffect(() => {
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);

        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
        };
    }, []);



    
    const getNotesByMonth = () => {
        const notesByMonth = Array(12).fill(0); // 12 mois
    
        notes.forEach(note => {
            const date = new Date(note.id);
            const month = date.getMonth(); // Récupère le mois (0 = Janvier, 11 = Décembre)
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
    

    const handleOnlineStatus = () => {
        setIsOnline(navigator.onLine);
        if (navigator.onLine) {
            syncWithIndexedDB();
        }
    };

    const syncWithIndexedDB = async () => {
        const db = await openDB('NotesApp', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('notes')) {
                    db.createObjectStore('notes', { keyPath: 'id' });
                }
            },
        });

        if (isOnline) {
            // Sync IndexedDB to State
            const storedNotes = await db.getAll('notes');
            if (storedNotes.length > 0) {
                setNotes(storedNotes);
            }
        } else {
            // Save current notes to IndexedDB
            for (let note of notes) {
                await db.put('notes', note);
            }
        }
    };

    const checkReminders = useCallback(() => {
        if (!Array.isArray(notes)) return;
        const now = new Date().getTime();
        for (let note of notes) {
            if (note.reminder && new Date(note.reminder).getTime() <= now) {
                showNotification(note);
            }
        }
    }, [notes]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkReminders();
        }, 60000);

        return () => clearInterval(interval);
    }, [checkReminders]);

    const showNotification = (note) => {
        if (!("Notification" in window)) {
            console.warn("Les notifications ne sont pas supportées par ce navigateur.");
            return;
        }

        if (Notification.permission === "granted") {
            new Notification("Rappel 📌", {
                body: `N'oubliez pas : ${note.title}`,
            });
            setNotes(prevNotes => prevNotes.map(n => (n.id === note.id ? { ...n, reminder: "" } : n)));
        }
    };

    const addNewNote = () => {
        setNotes(prevNotes => [...prevNotes, { id: Date.now(), title: "Nouvelle Note", content: "", color: "#000000", category: "Autres", reminder: "", priority: "Moyenne", attachments: [] }]);
    };

    const updateNote = (id, field, value) => {
        setNotes(prevNotes => {
            const updatedNotes = [];
            for (let note of prevNotes) {
                if (note.id === id) {
                    updatedNotes.push({ ...note, [field]: value });
                } else {
                    updatedNotes.push(note);
                }
            }
            return updatedNotes;
        });
    };

    const deleteNote = (id) => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    };

    const captureNote = async (noteId) => {
        const noteElement = document.getElementById(`note-${noteId}`);
        if (!noteElement) return;

        const canvas = await html2canvas(noteElement);
        const image = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = image;
        link.download = `note-${noteId}.png`;
        link.click();
    };

    const shareByEmail = (note) => {
        const subject = encodeURIComponent(`Partage de Note: ${note.title}`);
        const body = encodeURIComponent(`Voici une note partagée avec vous : \n\nTitre : ${note.title}\nContenu : ${note.content}\n\n`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const generateShareLink = (note) => {
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/shared-note/${note.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Lien copié dans le presse-papier : " + shareUrl);
    };

    const sortNotes = (notes) => {
        if (!Array.isArray(notes)) return [];

        const priorityOrder = { "Haute": 1, "Moyenne": 2, "Basse": 3 };

        return [...notes].sort((a, b) => {
            const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityComparison === 0) {
                return b.id - a.id;
            }
            return priorityComparison;
        });
    };

    const handleFileUpload = (noteId, files) => {
        const uploadedFiles = Array.from(files).map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
        }));

        setNotes(prevNotes => {
            const updatedNotes = [];
            for (let note of prevNotes) {
                if (note.id === noteId) {
                    updatedNotes.push({ ...note, attachments: [...note.attachments, ...uploadedFiles] });
                } else {
                    updatedNotes.push(note);
                }
            }
            return updatedNotes;
        });
    };

    const handlePaste = async (e, noteId) => {
        const clipboardItems = e.clipboardData.items;
    
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
    
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
    
                const compressedFile = await imageCompression(file, { maxSizeMB: 0.1 });
                const reader = new FileReader();
    
                reader.onload = (event) => {
                    const base64Image = event.target.result;
    
                    setNotes(prevNotes => {
                        const updatedNotes = [];
                        for (let note of prevNotes) {
                            if (note.id === noteId) {
                                updatedNotes.push({ ...note, content: `${note.content || ""}<img src="${base64Image}" alt="Collé" style="max-width: 100%;"/>` });
                            } else {
                                updatedNotes.push(note);
                            }
                        }
                        return updatedNotes;
                    });
                };
    
                reader.readAsDataURL(compressedFile);
                e.preventDefault();
                break;
            }
        }
    };

    const deleteAttachment = (noteId, fileIndex) => {
        setNotes(prevNotes => {
            const updatedNotes = [];
            for (let note of prevNotes) {
                if (note.id === noteId) {
                    updatedNotes.push({
                        ...note,
                        attachments: note.attachments.filter((_, index) => index !== fileIndex),
                    });
                } else {
                    updatedNotes.push(note);
                }
            }
            return updatedNotes;
        });
    };

    const filteredNotes = sortNotes(filter === "Toutes" ? notes : notes.filter(note => note.category === filter));

    return (
        <div>
            <div className="background">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
            </div>
      {/* Sélecteur de thème */}
      <button
    onClick={() => {
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        changeTheme(randomTheme);
    }}
    className="theme-random-btn"
>
    
    🎲 Thème Aléatoire
</button>
            <div className="content">
            <h1 className="title">Mes Notes {isOnline ? "🌐" : "🚫"}</h1>

           


                <label>Filtrer par catégorie :</label>
                <select onChange={(e) => setFilter(e.target.value)} className="filter-dropdown">
                    <option value="Toutes">Toutes</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <label>Trier par :</label>
                <select onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown">
                    <option value="date">Date</option>
                    <option value="priority">Priorité</option>
                </select>

                <button onClick={addNewNote} className="new-note-btn">
                    Nouvelle Note
                </button>

                <div className="notes-grid">
                    {filteredNotes.length === 0 ? (
                        <p>Aucune note disponible.</p>
                    ) : (
                        filteredNotes.map((note) => (
                            <div 
                            key={note.id} 
                            id={`note-${note.id}`} 
                            className={`notebook note`} 
                            style={{
                                borderColor: note.priority === "Haute" ? "#ff6b6b" 
                                            : note.priority === "Moyenne" ? "#ffd93d" 
                                            : "#6bcf6b",
                            }}
                        >
                                <div className="spiral"></div>
                                <div className="pages">
                                    <div className="page">
                                        <h2
                                            className="note-title"
                                            contentEditable="true"
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => updateNote(note.id, "title", e.target.innerText)}
                                        >
                                            {note.title}
                                        </h2>

                                        <label>Définir un rappel :</label>
                                        <input
                                            type="datetime-local"
                                            className="reminder-input"
                                            value={note.reminder}
                                            onChange={(e) => updateNote(note.id, "reminder", e.target.value)}
                                        />

                                        <p
                                            className="note-content scrollable-text"
                                            contentEditable="true"
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => updateNote(note.id, "content", e.target.innerHTML)}
                                            onPaste={(e) => handlePaste(e, note.id)}
                                            style={{ color: note.color }}
                                        >
                                            {note.content && <span dangerouslySetInnerHTML={{ __html: note.content }} />}
                                        </p>

                                        <label>Catégorie :</label>
                                        <select
                                            className="category-dropdown"
                                            value={note.category}
                                            onChange={(e) => updateNote(note.id, "category", e.target.value)}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>

                                        <label>Priorité :</label>
                                        <select
                                            className="priority-dropdown"
                                            value={note.priority}
                                            onChange={(e) => updateNote(note.id, "priority", e.target.value)}
                                        >
                                            <option value="Haute">Haute 🔥</option>
                                            <option value="Moyenne">Moyenne</option>
                                            <option value="Basse">Basse</option>
                                        </select>

                                        <label>Fichiers attachés :</label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileUpload(note.id, e.target.files)}
                                        />

                                        <ul className="attachments-list">
                                            {note.attachments.map((file, index) => (
                                                <li key={index}>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        {file.name}
                                                    </a>
                                                    <button onClick={() => deleteAttachment(note.id, index)}>
                                                        Supprimer
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="note-actions">
                                            <button onClick={() => deleteNote(note.id)} className="delete-btn">
                                                Supprimer
                                            </button>
                                            <button onClick={() => captureNote(note.id)} className="capture-btn">
                                                📸 Capture
                                            </button>
                                            <button onClick={() => shareByEmail(note)} className="share-btn">
                                                📧 Partager
                                            </button>
                                            <button onClick={() => generateShareLink(note)} className="link-btn">
                                                🔗 Lien
                                            </button>
                                            <button onClick={() => exportNoteToPDF(note.id)} className="export-pdf-btn">📄 Exporter PDF</button>

                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
            </div>
             {/* ➡️ Ajoutez le ChatBot ici */}
        <ChatBot notes={notes} />
        </div>

        
    );
    
};

export default App;