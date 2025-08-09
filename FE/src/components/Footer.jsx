// src/components/Footer.jsx
import React from 'react';

function Footer() {
    return (
        <footer style={{
            textAlign: 'center',
            padding: 0,
            marginTop: 'auto',
            background: `url(/images/footer-bg.jpg) center/cover no-repeat, #f8f9fa`,
            borderTop: '1px solid #e7e7e7',
            minHeight: 120,
            position: 'relative',
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.85)',
                padding: 20,
                borderRadius: 0,
                position: 'relative',
                zIndex: 2
            }}>
                <p style={{ fontWeight: 600, fontFamily: 'Montserrat, Roboto, Arial', fontSize: 18 }}>© {new Date().getFullYear()} Recruitment Project. All Rights Reserved.</p>
                <p>
                    <a href="/about">About</a> | <a href="/contact">Contact</a> | <a href="/privacy-policy">Privacy Policy</a>
                </p>
            </div>
        </footer>
    );
}

export default Footer;