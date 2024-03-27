import React from 'react';
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { LogViewer } from "@patternfly/react-log-viewer/dist/esm/LogViewer/index.js";

export const LogView = ({ data, ...props }) => {
    const logViewerRef = React.useRef();
    const [tailLogs, setTailLogs] = React.useState(true);

    React.useEffect(
        () => {
            if (tailLogs) {
                logViewerRef.current?.scrollToBottom();
            }
        },
        [data, tailLogs]
    );

    const onClick = React.useCallback(() => {
        setTailLogs(true);
        logViewerRef.current?.scrollToBottom();
    }, []);

    const onScroll = React.useCallback(({ scrollOffsetToBottom, scrollUpdateWasRequested }) => {
        if (!scrollUpdateWasRequested) {
            setTailLogs(scrollOffsetToBottom <= 0);
        }
    }, []);

    return (
        <LogViewer
            ref={logViewerRef}
            hasLineNumbers={false}
            {...props}
            data={data}
            onScroll={onScroll}
            footer={
                tailLogs
                    ? null
                    : <Button onClick={onClick}>Jump to the bottom</Button>
            }
        />
    );
};
