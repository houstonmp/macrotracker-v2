import classes from './PageContent.module.css';
import Card from './UI/Card';

function PageContent({ title, children, pageClass }) {
  return (
    <>
      <h1 className={classes.header}>{title}</h1>
      <div className={`${classes.container} ${pageClass}`}>
        {children}
      </div>
    </>

  );
}

export default PageContent;