const fs = require('fs');

const htmlFile = 'C:/Users/nonew/OneDrive/Images/1PHOTO/NOLAN ARC/PORTFOLIO_NOLANARC/index.html';
const rawHtml = fs.readFileSync(htmlFile, 'utf8');

// 1. Extract Styles
const styleMatch = rawHtml.match(/<style>([\s\S]*?)<\/style>/i);
if (styleMatch) {
  let css = styleMatch[1];
  // Remove absolute positioning of body if any to let React handle it
  fs.writeFileSync('src/original.css', css);
}

// 2. Extract Body Content
const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  let bodyContent = bodyMatch[1];
  
  // Remove inline scripts completely
  bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Convert HTML to JSX
  let jsx = bodyContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    // Auto-close unpaired tags
    .replace(/<(img|input|br|hr|meta|link)([^>]*?)(?<!\/)>/g, '<$1$2 />')
    // Fix inline styles: naive removal or conversion. To prevent JS crashes, we'll strip complex inline styles
    // or convert them carefully. We will just remove inline styles to avoid React parsing errors,
    // except for simple ones. Actually, stripping style="" is safest for large files.
    .replace(/style="[^"]*"/g, '') 
    // Fix comments
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  // Generate the React Component
  const componentCode = `
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './original.css';

export const OriginalSite = () => {
  return (
    <div className="original-site-container" style={{ position: 'relative', zIndex: 10 }}>
       {/* 
         On wrappera dynamiquement les titres avec framer-motion 
         pour ajouter la Google Sauce 
       */}
       ${jsx}
    </div>
  );
};
  `;

  fs.writeFileSync('src/OriginalSite.tsx', componentCode);
  console.log("Conversion successful!");
} else {
  console.log("Could not find body tag.");
}
