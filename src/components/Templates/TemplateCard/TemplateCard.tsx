import {Button} from "components/Button";
import {ReactComponent as FavouriteIcon} from "assets/icons/star.svg";
import {ReactComponent as MenuIcon} from "assets/icons/three-dots.svg";
import {ReactComponent as ColumnsIcon} from "assets/icons/columns.svg";
import {ReactComponent as NextIcon} from "assets/icons/next.svg";
import classNames from "classnames";
import "./TemplateCard.scss";

export const TemplateCard = () => (
  <div className="template-card">
    <FavouriteIcon className={classNames("template-card__icon", "template-card__icon--favourite")} />
    <div className="template-card__title">Title</div>
    <MenuIcon className={classNames("template-card__icon", "template-card__icon--menu")} />
    <div className="template-card__description">Lorem ipsum dolor sit amet, conse dolo sadipscing elitr vero eos et aquiteres.</div>
    <ColumnsIcon className={classNames("template-card__icon", "template-card__icon--columns")} />
    <div className="template-card__columns">
      <div className="template-card__columns-title">3 Columns</div>
      <div className="template-card__columns-subtitle">Ideas, Problems & Solutions</div>
    </div>
    <Button className="template-card__start-button" small icon={<NextIcon />}>
      Start
    </Button>
  </div>
);
