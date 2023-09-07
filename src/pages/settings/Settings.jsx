import PageContent from "../../components/PageContent";
import classes from "./Settings.module.css"

const Settings = props => {
    return <>
        <div className={classes.settings}>
            <PageContent title="Settings" classes={classes.settings}>
            </PageContent>
        </div>
    </>
}

export default Settings;