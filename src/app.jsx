/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";
import { Stack, StackItem } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { LogViewer } from "@patternfly/react-log-viewer/dist/esm/LogViewer/index.js";

const _ = cockpit.gettext;

const DEPLOY_STATES = {
    UNKNOWN: "unknown",
    DEPLOYING: "deploying",
    DEPLOYED: "deployed",
    FAILED: "failed"
};

const ALERT_DEPLY_STATE_MAP = {
    [DEPLOY_STATES.DEPLOYED]: "success",
    [DEPLOY_STATES.FAILED]: "danger",
};

export const Application = () => {
    const [hostname, setHostname] = React.useState(_("Unknown"));
    const [deployState, setDeployState] = React.useState(DEPLOY_STATES.UNKNOWN);
    const [output, setOutput] = React.useState("");

    React.useEffect(() => {
        cockpit.file('/etc/hostname').watch(content => {
            setHostname(content.trim());
        });
    }, []);

    const deployOpenShift = React.useCallback(
        () => {
            if (deployState === DEPLOY_STATES.DEPLOYING) {
                return;
            }

            setDeployState(DEPLOY_STATES.DEPLOYING);
            cockpit.spawn(["ping", "-c", "4", "8.8.8.8"])
                    .stream((data) => setOutput((output) => output + data))
                    .then(() => setDeployState(DEPLOY_STATES.DEPLOYED))
                    .catch(() => setDeployState(DEPLOY_STATES.FAILED));
        },
        [deployState]
    );

    return (
        <Card>
            <CardTitle>OpenShift</CardTitle>
            <CardBody>
                <Stack hasGutter>
                    <StackItem>
                        <Button
                            isDisabled={deployState === DEPLOY_STATES.DEPLOYING}
                            onClick={deployOpenShift}
                        >
                            {
                                _(
                                    deployState === DEPLOY_STATES.DEPLOYING
                                        ? "Deploying..."
                                        : "Deploy OpenShift"
                                )
                            }
                        </Button>
                    </StackItem>
                    {
                        deployState === DEPLOY_STATES.UNKNOWN
                            ? null
                            : (
                                <StackItem>
                                    <Alert
                                        variant={ALERT_DEPLY_STATE_MAP[deployState] ?? "info"}
                                        title={ cockpit.format(_("Running on $0"), hostname) }
                                    />
                                </StackItem>
                            )
                    }
                    {
                        output.length > 0
                            ? (
                                <StackItem>
                                    <LogViewer hasLineNumbers={false} height={300} data={output} />
                                </StackItem>
                            )
                            : null
                    }
                </Stack>
            </CardBody>
        </Card>
    );
};
