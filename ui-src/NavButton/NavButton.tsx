import './NavButton.scss';

function NavButton(props: any) {
  var perc = (props.value / props.total * 100);
  const showBar = props.showBar;
  if(showBar) perc = 100 - perc;
  var percentage = perc.toFixed(0);
  const color = perc > 80 ? "#8FD498" : (perc > 60 ? "#FFA47D" : "#F17171");
  return(
    <button>
      <h2>{percentage}{showBar && "%"}</h2>
      {showBar &&
      <div className="progressbar">
        <div className="progression" style={{width: percentage+"%", backgroundColor: color}}></div>
      </div>
      }
      <h4 className="small">{props.name}</h4>
    </button>
  );
}

export default NavButton;