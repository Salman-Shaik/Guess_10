import { IconInfo } from '../lib/types';


export function IconInfoGrid({ info }: { info: IconInfo }) {
    return (
        <div className="gi10-icongrid">
            <div className="item"><span>Star Tag</span><strong>{info.starTag}</strong></div>
            <div className="item"><span>Born</span><strong>{info.placeOfBirth}</strong></div>
            <div className="item"><span>Notable Honour</span><strong>{info.highestAward}</strong></div>
            <div className="item"><span>Also Known For</span><strong>{info.alsoKnownFor}</strong></div>
        </div>
    );
}
