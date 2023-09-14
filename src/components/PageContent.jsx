import classes from './PageContent.module.css';
import Card from './UI/Card';

function PageContent({ title, children }) {
  return (
    <>
      <h1>{title}</h1>
      <div>
        {children}
      </div>

    </>

  );
}

export default PageContent;