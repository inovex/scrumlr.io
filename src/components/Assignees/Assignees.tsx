// import { useState } from "react";
import {useAppSelector} from "store";
// import { Assignee } from "./Assignee";
import {Autocomplete} from "./Autocomplete";

export const Assignees = () => {
  // const [showList, setShowList] = useState(false);

  const {me, them} = useAppSelector((state) => ({
    them: state.participants!.others.filter((participant) => participant.connected).slice(),
    me: state.participants!.self,
  }));

  const participants = [me.user, ...them.map((participant) => participant.user)];

  // const ShowParticipantList = () => {
  //     return <>
  //     <input></input>
  //         {participants.map((participant, index) => {
  //             console.log("chek");
  //             return <Assignee participant={participant} index={index}/>
  //         })}
  //     </>
  // }

  return (
    <div className="note-dialog__assignees">
      {
        <Autocomplete suggestions={participants} />
        // <button title='assign someone' onClick={() => setShowList(!showList)}>Assign</button>
        // {showList && ShowParticipantList()}
      }
    </div>
  );
};

/* <Autocomplete
            multiple
            freeSolo
            readOnly={me.role === "PARTICIPANT"}
            limitTags={3}
            id="tags-filled"
            options={participants.map(p => p.name)}
            renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip participant={participants[index]} />                    
                ))                
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    className='assignees'
                    variant="standard"
                    label="Assignees"
                    placeholder="Assign someone"
                />
            )}

        /> */
