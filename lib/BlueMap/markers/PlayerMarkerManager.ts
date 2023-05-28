/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { PlayerMarkerSet } from "./PlayerMarkerSet";
import { MarkerManager } from "./MarkerManager";
import { MarkerSet } from "./MarkerSet";
import { MarkerData } from "./Marker";

export const PLAYER_MARKER_SET_ID = "bm-players";

export class PlayerMarkerManager extends MarkerManager {
    public playerheadsUrl: string;

    public constructor(
        root: MarkerSet,
        fileUrl: string,
        playerheadsUrl: string,
        events?: EventTarget
    ) {
        super(root, fileUrl, events);

        this.playerheadsUrl = playerheadsUrl;
    }

    protected updateFromData(markerFileData: MarkerData) {
        let playerMarkerSet = this.getPlayerMarkerSet(Array.isArray(markerFileData.players));
        if (!playerMarkerSet) return false;
        return playerMarkerSet.updateFromPlayerData(markerFileData);
    }

    private getPlayerMarkerSet(create = true) {
        let playerMarkerSet: PlayerMarkerSet = (this.root as PlayerMarkerSet).markerSets.get(
            PLAYER_MARKER_SET_ID
        )! as PlayerMarkerSet;

        if (!playerMarkerSet && create) {
            playerMarkerSet = new PlayerMarkerSet(PLAYER_MARKER_SET_ID, this.playerheadsUrl);
            this.root.add(playerMarkerSet);
        }

        return playerMarkerSet;
    }

    public getPlayerMarker(playerUuid: string) {
        return this.getPlayerMarkerSet()!.getPlayerMarker(playerUuid);
    }
}
