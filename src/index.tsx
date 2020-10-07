import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import plus from './assets/add.svg';
import avatar from './assets/avatar.png';


ReactDOM.render(
  <React.StrictMode>
    <div className="column-wrapper">

      <div className="header"></div>

      <div className="column color-blue">
        <div className="column-content column-content--first">
          <div className="column-header">
            <h1 className="column-header__text">Keep</h1>
            <h1 className="column-header__card-number">5</h1>
          </div>

          <div className="add-card">
            <p className="add-card__text">Add your note...</p>
            <img className="add-card__icon" src={plus} alt="Plus" />
          </div>

          <div className="cards-wrapper">
            <div className="cards">

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="column color-purple">
        <div className="column-content">
          <div className="column-header">
            <h1 className="column-header__text">Add</h1>
            <h1 className="column-header__card-number">3</h1>
          </div>

          <div className="add-card">
            <p className="add-card__text">Add your note...</p>
            <img className="add-card__icon" src={plus} alt="Plus" />
          </div>

          <div className="cards-wrapper">
            <div className="cards">

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="column color-violet">
        <div className="column-content">
          <div className="column-header">
            <h1 className="column-header__text">Less</h1>
            <h1 className="column-header__card-number">7</h1>
          </div>

          <div className="add-card">
            <p className="add-card__text">Add your note...</p>
            <img className="add-card__icon" src={plus} alt="Plus" />
          </div>

          <div className="cards-wrapper">
            <div className="cards">

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="column color-pink">
        <div className="column-content column-content--last">
          <div className="column-header">
            <h1 className="column-header__text">More</h1>
            <h1 className="column-header__card-number">9</h1>
          </div>

          <div className="add-card">
            <p className="add-card__text">Add your note...</p>
            <img className="add-card__icon" src={plus} alt="Plus" />
          </div>

          <div className="cards-wrapper">
            <div className="cards">

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

              <div className="card">
                <p className="card__text">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.</p>
                <div className="card__author">
                  <img className="card__author-image" src={avatar} alt="User"/>
                  <p className="card__author-name">Jana Becker</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
