import classes from './PageContent.module.css';
import Card from './UI/Card';

function PageContent({ title, children }) {
  return (
    <Card className={classes.content}>
      <h1>{title}</h1>
      {children}
    </Card>
  );
}

export default PageContent;