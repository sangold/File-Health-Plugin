import './NavButton.scss';

function NavButton(props: any) {
  var percentage = (props.value/props.total * 100).toFixed(0);
  const showBar = props.showBar;
  return(
    <button>
      <h2>{percentage}{showBar && "%"}</h2>
      {showBar &&
      <div className="progressbar">
        <div className="progression" style={{width: percentage+"%"}}></div>
      </div>
      }
      <h4 className="small">{props.name}</h4>
    </button>
  );
}

export default NavButton;