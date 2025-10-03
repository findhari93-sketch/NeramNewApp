"use client";

import React from "react";
import { Fab } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const WhatsAppChatBubble = () => {
  // Replace handleClick with your function to open WhatsApp chat
  const handleClick = () => {
    // WhatsApp number to which you want to send the message
    const phoneNumber = "+919176137043"; // Replace with your WhatsApp number

    // Message to be included in the WhatsApp chat
    const message =
      "Hello! I'm contacting you from the neramClasses.com WebApp, I would like to join neramClasses for my NATA preparation.";

    // Encoding the message for use in the URL
    const encodedMessage = encodeURIComponent(message);

    // Constructing the WhatsApp URL with the phone number and message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Opening the WhatsApp URL in a new tab/window
    window.open(whatsappUrl, "_blank");

    // Log the action
    console.log("Opening WhatsApp chat...");
  };

  return (
    <Fab
      color="primary"
      aria-label="whatsapp"
      onClick={handleClick}
      sx={{
        position: "fixed",
        bottom: 20,
        left: 20,
        backgroundColor: "#075e54",
        width: 50,
        height: 50,
        "&:hover": {
          backgroundColor: "#064e47",
        },
        "@media (max-width: 768px)": {
          width: 40,
          height: 40,
          bottom: 0,
          left: 0,
          borderRadius: "0 50px 0 0",
          "& .MuiSvgIcon-root": {
            position: "relative",
            left: "-4px",
            bottom: "-4px",
          },
        },
      }}
    >
      <WhatsAppIcon />
    </Fab>
  );
};

export default WhatsAppChatBubble;
