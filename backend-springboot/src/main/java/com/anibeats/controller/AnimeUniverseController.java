package com.anibeats.controller;

import com.anibeats.model.AnimeUniverseModels.*;
import com.anibeats.service.AnimeUniverseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/anime-universe")
@CrossOrigin(origins = "*")
public class AnimeUniverseController {

    private final AnimeUniverseService service;

    public AnimeUniverseController(AnimeUniverseService service) {
        this.service = service;
    }

    @GetMapping
    public AnimeUniverseState getAll() {
        return service.getState();
    }

    @PostMapping("/collection")
    public AnimeUniverseState addCollection(@Valid @RequestBody CompletedAnimeItem item) throws IOException {
        return service.addCollectionItem(item);
    }

    @PutMapping("/collection/{id}")
    public AnimeUniverseState updateCollection(
        @PathVariable String id,
        @Valid @RequestBody CompletedAnimeItem item
    ) throws IOException {
        return service.updateCollectionItem(id, item);
    }

    @DeleteMapping("/collection/{id}")
    public AnimeUniverseState deleteCollection(@PathVariable String id) throws IOException {
        return service.deleteCollectionItem(id);
    }

    @PostMapping("/collection/reorder")
    public AnimeUniverseState reorderCollection(@RequestBody ReorderRequest req) throws IOException {
        return service.reorderCollection(req.orderedIds());
    }

    @PostMapping("/watching")
    public AnimeUniverseState addWatching(@Valid @RequestBody CurrentlyWatchingItem item) throws IOException {
        return service.addWatchingItem(item);
    }

    @PutMapping("/watching/{id}")
    public AnimeUniverseState updateWatching(
        @PathVariable String id,
        @Valid @RequestBody CurrentlyWatchingItem item
    ) throws IOException {
        return service.updateWatchingItem(id, item);
    }

    @DeleteMapping("/watching/{id}")
    public AnimeUniverseState deleteWatching(@PathVariable String id) throws IOException {
        return service.deleteWatchingItem(id);
    }

    @PostMapping("/discovery")
    public AnimeUniverseState addDiscovery(@Valid @RequestBody DiscoveryAnimeItem item) throws IOException {
        return service.addDiscoveryItem(item);
    }

    @PutMapping("/discovery/{id}")
    public AnimeUniverseState updateDiscovery(
        @PathVariable String id,
        @Valid @RequestBody DiscoveryAnimeItem item
    ) throws IOException {
        return service.updateDiscoveryItem(id, item);
    }

    @DeleteMapping("/discovery/{id}")
    public AnimeUniverseState deleteDiscovery(@PathVariable String id) throws IOException {
        return service.deleteDiscoveryItem(id);
    }

    @PostMapping("/discovery/{id}/promote")
    public AnimeUniverseState promoteDiscovery(
        @PathVariable String id,
        @RequestBody PromoteDiscoveryRequest req
    ) throws IOException {
        return service.promoteDiscoveryToCollection(id, req);
    }

    @PostMapping("/reset")
    public AnimeUniverseState resetToDefaults() throws IOException {
        return service.resetToDefaults();
    }
}
