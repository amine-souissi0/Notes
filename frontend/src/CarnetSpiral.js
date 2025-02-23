import React from "react";
import "./CarnetSpiral.css";

const CarnetSpiral = ({ title, content }) => {
    return (
        <div className="notebook">
            {/* Spirales */}
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>
            <div className="spiral"></div>

            {/* Corps du carnet */}
            <div className="pages">
                <div className="page">
                    <h2 className="note-title">{title}</h2>
                    <p className="note-content">{content}</p>
                </div>
            </div>
        </div>
    );
};

export default CarnetSpiral;
