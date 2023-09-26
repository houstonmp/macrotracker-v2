const EntryFilter = () => {
    return <div className={formClasses.form}>
        <ul>
            <SearchInput onSearch={props.onFilter} label="Filter Name" />
            <RadioInput onChange={switchRadioFilter} radioBtnArray={{ name: 'recipeRadioFilter', value: ['Macros', 'Ingredients'] }} />
        </ul>
    </div>
}

export default EntryFilter