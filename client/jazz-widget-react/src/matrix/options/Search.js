import React, {Component} from 'react';  

const Search = ({
    searchTerm,
    onChange,
    placeholder
}) => <input type="text" onChange={onChange} value={searchTerm} placeholder={placeholder}/>

export default Search;