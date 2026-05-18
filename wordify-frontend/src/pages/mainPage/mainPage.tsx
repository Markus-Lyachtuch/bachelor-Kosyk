import "./adds.css";
import "./mainPage.styl";
import { useNavigate } from 'react-router-dom';

import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";
import BookLogo from 'shared/assets/icons/bookLogo.svg?react';
import WordifyRightImg from 'shared/assets/images/words4uRightImg.webp';

export const MainPage = () => {
  const nav = useNavigate();

  return (
    <div className="main flex-center">
      <div className="main-left flex-col">
        <div className="main-left-header flex-y-center">
          <BookLogo />
          <span>Wordify</span>
        </div>

        <Title dataTestId="cypress-main-left-title" className='main-left-title' variant='welcome'>Discover NEW Method</Title>
        <p className="main-left-paragraph">Find out what words you find interesting, learn new vocabulary and use AI, connecting word, its definition and association</p>
        <Button dataTestId="cypress-main-left-btn" onClick={() => nav("/home")} className="main-left-btn" variant="primary">Start learning</Button>
      </div>
      <div className="main-right flex-center flex-col">
        <img className='main-right-img' src={WordifyRightImg} alt="wordify Right" />
        <span className='main-right-text'>Wordify with AI</span>
      </div>
    </div>
  );
};
