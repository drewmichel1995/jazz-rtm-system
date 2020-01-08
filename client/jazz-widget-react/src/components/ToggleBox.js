import React from "react";

class ToggleBox extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			opened: false,
		};
		this.toggleBox = this.toggleBox.bind(this);
	}
  
	toggleBox() {
		const { opened } = this.state;
		this.setState({
			opened: !opened,
		});
	}
  
	render() {
		var { title, children, showTitle, hideTitle } = this.props;
        const { opened } = this.state;

		if (opened){
			title =hideTitle;
		}else{
			title =showTitle;
		}

		return (
			<div className="box">
				<div className="boxTitle" onClick={this.toggleBox}>
					{title}
				</div>
				{opened && (					
					<div className="boxContent">
						{children}
					</div>
				)}
			</div>
		);
	}
}

export default ToggleBox;