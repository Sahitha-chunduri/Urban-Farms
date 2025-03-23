import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatPanel.css';

function ChatPanel({ isChatOpen, onClose }) {
  const [messageText, setMessageText] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe', lastSeen: 'Online', unread: 2 },
    { id: 2, name: 'Jane Smith', lastSeen: '5m ago', unread: 0 },
    { id: 3, name: 'Mike Brown', lastSeen: '1h ago', unread: 0 },
    { id: 4, name: 'Sarah Williams', lastSeen: 'Yesterday', unread: 3 }
  ]);

  const [chats, setChats] = useState({
    1: [
      { id: 1, sender: 'John Doe', content: 'Hey, how are your crops?', timestamp: '9:30 AM', isMine: false },
      { id: 2, sender: 'You', content: 'Going well! Just harvested some tomatoes.', timestamp: '9:32 AM', isMine: true }
    ],
    2: [
      { id: 1, sender: 'Jane Smith', content: 'Did you see the new farming webinar?', timestamp: 'Yesterday', isMine: false }
    ]
  });

  const handleChatSelect = (contactId) => {
    setActiveChat(contactId);
    setContacts(contacts.map(contact => contact.id === contactId ? { ...contact, unread: 0 } : contact));
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;
  
    const newMessage = { 
      id: Date.now(), 
      sender: 'You', 
      content: messageText, 
      timestamp: 'Just now', 
      isMine: true 
    };
  
    // Update chats state with the new message
    setChats((prevChats) => ({
      ...prevChats,
      [activeChat]: [...(prevChats[activeChat] || []), newMessage]
    }));
  
    setMessageText(''); // Clear the input field
  
    // Simulate a reply after 1.5 seconds
    setTimeout(() => {
      const responses = ['Got it!', 'Sounds great!', 'Thanks for sharing!', 'I will check it out!'];
      const newReply = { 
        id: Date.now() + 1, 
        sender: contacts.find((c) => c.id === activeChat)?.name || 'Contact', 
        content: responses[Math.floor(Math.random() * responses.length)], 
        timestamp: 'Just now', 
        isMine: false 
      };
  
      setChats((prevChats) => ({
        ...prevChats,
        [activeChat]: [...(prevChats[activeChat] || []), newReply]
      }));
    }, 1500);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, activeChat]);

  return (
    <div className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>Messages</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filteredContacts.map(contact => (
            <div key={contact.id} className={`chat-contact ${activeChat === contact.id ? 'active' : ''}`} onClick={() => handleChatSelect(contact.id)}>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-last-seen">{contact.lastSeen}</div>
              </div>
              {contact.unread > 0 && <div className="unread-badge">{contact.unread}</div>}
            </div>
          ))}
        </div>

        <div className="chat-messages-container">
          {activeChat ? (
            <>
              <div className="chat-messages" ref={chatContainerRef}>
                {chats[activeChat]?.map(msg => (
                  <div key={msg.id} className={`message ${msg.isMine ? 'mine' : 'other'}`}>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
              <form className="message-input-container" onSubmit={handleSendMessage}>
                <input type="text" placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} ref={messageInputRef} />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">Select a conversation to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;