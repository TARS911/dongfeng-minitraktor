"use client";

import { useModal } from "../../hooks/useModal";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from 'react-toastify';
import './CallbackModal.css';

const CallbackModal = () => {
  const { isOpen, closeModal } = useModal();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase.from('callbacks').insert([{ phone, name }]);

    if (error) {
      toast.error('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    } else {
      toast.success('Спасибо! Мы скоро с вами свяжемся.');
      setPhone("");
      setName("");
      closeModal();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>&times;</button>
        <h2>Заказать звонок</h2>
        <p>Оставьте свой номер телефона и мы вам перезвоним</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Ваше имя</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Номер телефона</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CallbackModal;
