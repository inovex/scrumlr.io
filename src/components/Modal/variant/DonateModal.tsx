import * as React from 'react';

import './DonateModal.css';
import Modal from '../Modal';

export interface DonateModalProps {
  onClose: () => void;
}

export class DonateModal extends React.Component<DonateModalProps, {}> {
  render() {
    return (
      <Modal onClose={this.props.onClose}>
        <h2>Donate</h2>

        <p className="donate__paragraph">
          Offering this service to you for free and without ads everywhere,
          means that we have zero income. Yet we have some regular costs, like
          for operating this webserver. If you like our service and you want to
          support us, we would very much appreciate your donation. Regardless of
          the amount you are willing the amount.
        </p>

        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
        >
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="3L4UWLZSXKYQE" />
          <input
            type="image"
            src="https://www.paypalobjects.com/en_US/DE/i/btn/btn_donateCC_LG.gif"
            name="submit"
            alt="PayPal - The safer, easier way to pay online!"
          />
          <img
            alt=""
            src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif"
            width="1"
            height="1"
          />
        </form>
      </Modal>
    );
  }
}

export default DonateModal;
