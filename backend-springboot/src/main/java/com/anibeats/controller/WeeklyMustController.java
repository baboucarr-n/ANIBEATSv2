package com.anibeats.controller;

import com.anibeats.model.WeeklyMust;
import com.anibeats.service.WeeklyMustService;
import com.anibeats.service.WeeklyMustService.WeeklyMustInput;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class WeeklyMustController {

    private final WeeklyMustService service;

    public WeeklyMustController(WeeklyMustService service) {
        this.service = service;
    }

    @GetMapping("/api/weekly-must/current")
    public ResponseEntity<WeeklyMust> getCurrent() {
        return service.getCurrent()
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.ok(null));
    }

    @GetMapping("/api/weekly-must/archive")
    public List<WeeklyMust> getArchive() {
        return service.getArchive();
    }

    @GetMapping("/api/weekly-must/{id}")
    public WeeklyMust getSingle(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping("/api/admin/weekly-must")
    public WeeklyMust create(@RequestBody WeeklyMustInput input) {
        return service.create(input);
    }

    @PutMapping("/api/admin/weekly-must/{id}")
    public WeeklyMust update(@PathVariable Long id, @RequestBody WeeklyMustInput input) {
        return service.update(id, input);
    }

    @DeleteMapping("/api/admin/weekly-must/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/admin/weekly-must/{id}/set-current")
    public WeeklyMust setCurrent(@PathVariable Long id) {
        return service.setCurrent(id);
    }
}
